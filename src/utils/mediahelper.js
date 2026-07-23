const CDN_DOMAIN = 'https://cdn.ultrastone.in';

const encodeUrlPath = (url) => {
    if (!url) {
        return '';
    }

    try {
        const parsed = new URL(url);

        parsed.pathname = parsed.pathname
            .split('/')
            .map((part) => {
                try {
                    return encodeURIComponent(
                        decodeURIComponent(part)
                    );
                } catch {
                    return encodeURIComponent(part);
                }
            })
            .join('/');

        return parsed.toString();
    } catch {
        return url;
    }
};

export const getOptimizedImageUrl = (
    url,
    width = 1200,
    quality = 75
) => {
    if (!url) {
        return '';
    }

    if (
        url.startsWith('blob:') ||
        url.startsWith('data:')
    ) {
        return url;
    }

    try {
        const parsed = new URL(url);

        if (parsed.origin !== CDN_DOMAIN) {
            return encodeUrlPath(url);
        }

        if (
            parsed.pathname.startsWith(
                '/cdn-cgi/image/'
            )
        ) {
            return encodeUrlPath(url);
        }

        const safeWidth = Math.max(
            50,
            Math.round(Number(width) || 1200)
        );

        const safeQuality = Math.min(
            100,
            Math.max(
                1,
                Math.round(Number(quality) || 75)
            )
        );

        const encodedUrl =
            encodeUrlPath(url);

        const encodedParsed =
            new URL(encodedUrl);

        const sourcePath = `${encodedParsed.pathname}${encodedParsed.search}`;

        return `${CDN_DOMAIN}/cdn-cgi/image/width=${safeWidth},quality=${safeQuality},format=auto,fit=scale-down,metadata=none${sourcePath}`;
    } catch {
        return encodeUrlPath(url);
    }
};

export const getOriginalSafeUrl = (
    url
) => {
    if (!url) {
        return '';
    }

    return encodeUrlPath(url);
};

export const getOptimizedVideoUrl = (
    url,
    {
        width = 1280,
        height,
        fit = 'scale-down',
        audio = false,
        duration,
        time,
    } = {}
) => {
    if (!url) {
        return '';
    }

    if (
        url.startsWith('blob:') ||
        url.startsWith('data:')
    ) {
        return url;
    }

    try {
        const parsed = new URL(url);

        if (parsed.origin !== CDN_DOMAIN) {
            return encodeUrlPath(url);
        }

        if (
            parsed.pathname.startsWith(
                '/cdn-cgi/media/'
            )
        ) {
            return encodeUrlPath(url);
        }

        const safeWidth = Math.max(
            100,
            Math.round(Number(width) || 1280)
        );

        const safeHeight = height
            ? Math.max(
                  100,
                  Math.round(Number(height))
              )
            : null;

        const encodedUrl =
            encodeUrlPath(url);

        const encodedParsed =
            new URL(encodedUrl);

        const sourcePath = `${encodedParsed.pathname}${encodedParsed.search}`;

        const options = [
            'mode=video',
            `width=${safeWidth}`,
            safeHeight
                ? `height=${safeHeight}`
                : null,
            `fit=${fit}`,
            `audio=${Boolean(audio)}`,
            time !== undefined &&
            time !== null
                ? `time=${time}`
                : null,
            duration !== undefined &&
            duration !== null
                ? `duration=${duration}`
                : null,
        ]
            .filter(Boolean)
            .join(',');

        return `${CDN_DOMAIN}/cdn-cgi/media/${options}${sourcePath}`;
    } catch {
        return encodeUrlPath(url);
    }
};