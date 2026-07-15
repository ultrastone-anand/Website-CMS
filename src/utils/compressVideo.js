import {
    Input,
    Output,
    Conversion,
    BlobSource,
    ALL_FORMATS,
    BufferTarget,
    Mp4OutputFormat,
} from 'mediabunny';

const MB = 1024 * 1024;

export const VIDEO_COMPRESSION_THRESHOLD = 50 * MB;

// Aim slightly below 50 MB so container overhead does not cross the limit.
const TARGET_OUTPUT_SIZE = 45 * MB;

export function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return '0 MB';
    }

    return `${(bytes / MB).toFixed(2)} MB`;
}

export function shouldCompressVideo(file) {
    return (
        file?.type?.startsWith('video/') &&
        file.size > VIDEO_COMPRESSION_THRESHOLD
    );
}

export async function compressVideo(file, onProgress = () => {}) {
    if (!(file instanceof File)) {
        throw new TypeError('A valid video file is required.');
    }

    if (!file.type.startsWith('video/')) {
        throw new TypeError('The selected file is not a video.');
    }

    if (!('VideoEncoder' in window) || !('VideoDecoder' in window)) {
        throw new Error(
            'This browser does not support frontend video compression. Please use the latest Chrome or Edge.'
        );
    }

    const input = new Input({
        source: new BlobSource(file),
        formats: ALL_FORMATS,
    });

    const canRead = await input.canRead();

    if (!canRead) {
        throw new Error('This video format could not be read by the browser.');
    }

    const duration =
        (await input.getDurationFromMetadata()) ||
        (await input.computeDuration());

    if (!Number.isFinite(duration) || duration <= 0) {
        throw new Error('Could not determine the video duration.');
    }

    const videoTrack = await input.getPrimaryVideoTrack();

    if (!videoTrack) {
        throw new Error('No video track was found in the selected file.');
    }

    const originalWidth = await videoTrack.getDisplayWidth();
    const originalHeight = await videoTrack.getDisplayHeight();

    const hasAudio = Boolean(await input.getPrimaryAudioTrack());

    /*
     * Approximate output bitrate:
     *
     * file size in bytes × 8 = bits
     * bits ÷ duration = total bits per second
     */
    const audioBitrate = hasAudio ? 96_000 : 0;

    const targetTotalBitrate = Math.floor(
        (TARGET_OUTPUT_SIZE * 8) / duration
    );

    /*
     * Keep reasonable quality limits.
     *
     * Minimum: 700 Kbps
     * Maximum: 5 Mbps
     */
    const videoBitrate = Math.max(
        700_000,
        Math.min(5_000_000, targetTotalBitrate - audioBitrate)
    );

    /*
     * Limit the longest dimension to 1920px.
     * Smaller videos are not enlarged.
     */
    const isPortrait = originalHeight > originalWidth;

    const videoOptions = {
        codec: 'avc',
        bitrate: videoBitrate,
        frameRate: 30,
        forceTranscode: true,
        hardwareAcceleration: 'prefer-hardware',
    };

    if (isPortrait) {
        videoOptions.height = Math.min(originalHeight, 1920);
    } else {
        videoOptions.width = Math.min(originalWidth, 1920);
    }

    const target = new BufferTarget();

    const output = new Output({
        format: new Mp4OutputFormat(),
        target,
    });

    const conversion = await Conversion.init({
        input,
        output,
        tracks: 'primary',
        video: videoOptions,
        audio: hasAudio
            ? {
                  codec: 'aac',
                  bitrate: audioBitrate,
                  numberOfChannels: 2,
                  forceTranscode: true,
              }
            : {
                  discard: true,
              },
    });

    if (!conversion.isValid) {
        console.error(
            'Mediabunny discarded tracks:',
            conversion.discardedTracks
        );

        throw new Error(
            'This browser could not encode the selected video into MP4.'
        );
    }

    conversion.onProgress = (progress) => {
        const percentage = Math.min(
            99,
            Math.max(0, Math.round(progress * 100))
        );

        onProgress(percentage);
    };

    await conversion.execute();

    if (!target.buffer) {
        throw new Error('The compressed video output is empty.');
    }

    const compressedBlob = new Blob([target.buffer], {
        type: 'video/mp4',
    });

    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');

    const compressedFile = new File(
        [compressedBlob],
        `${nameWithoutExtension}-compressed.mp4`,
        {
            type: 'video/mp4',
            lastModified: Date.now(),
        }
    );

    onProgress(100);

    console.log('Original video:', formatFileSize(file.size));
    console.log(
        'Compressed video:',
        formatFileSize(compressedFile.size)
    );

    /*
     * Avoid replacing the original if conversion somehow creates
     * a larger file.
     */
    if (compressedFile.size >= file.size) {
        return file;
    }

    return compressedFile;
}