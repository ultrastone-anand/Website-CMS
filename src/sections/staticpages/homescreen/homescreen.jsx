import PropTypes from "prop-types";
import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  Box,
  Tab,
  Card,
  Chip,
  Grid,
  Tabs,
  Alert,
  Stack,
  Button,
  Dialog,
  Select,
  Switch,
  Divider,
  MenuItem,
  Container,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  CardContent,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
  CircularProgress,
  FormControlLabel,
} from "@mui/material";

import Iconify from "src/components/iconify";

import {
  getActiveHomeHero,
  getDefaultHomeHero,
  getHomeHeroHolidays,
  getHomeHeroCampaigns,
  forceHomeHeroHoliday,
  toggleHomeHeroHoliday,
  updateDefaultHomeHero,
  updateHomeHeroHoliday,
  createHomeHeroCampaign,
  deleteHomeHeroCampaign,
  toggleHomeHeroCampaign,
  updateHomeHeroCampaign,
  uploadHomeHeroMediaToR2,
  createHomeHeroUploadUrls,
} from "../../../services/home.service";

/* =========================================================
   CONSTANTS
========================================================= */

const MEDIA_TYPES = [
  "IMAGE",
  "VIDEO",
];

const ANIMATIONS = [
  "NONE",
  "FADE",
  "SLIDE_UP",
  "SLIDE_DOWN",
  "SLIDE_LEFT",
  "SLIDE_RIGHT",
  "ZOOM_IN",
  "ZOOM_OUT",
];

const CAMPAIGN_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "ARCHIVED",
];

const DURATION_MODES = [
  "DAY",
  "TWO_DAYS",
  "WEEK",
  "CUSTOM",
];

const DEFAULT_TIMEZONE =
  "America/New_York";

/* =========================================================
   INITIAL DATA
========================================================= */

const createHeroForm = () => ({
  media_type:
    "VIDEO",

  media_url:
    "",

  poster_url:
    "",

  mobile_media_url:
    "",

  mobile_poster_url:
    "",

  alt_text:
    "",

  heading:
    "",

  description:
    "",

  text_animation:
    "SLIDE_UP",

  keep_text_visible:
    false,

  text_start_delay:
    150,

  text_animation_duration:
    1400,

  description_delay:
    450,

  text_visible_duration:
    3100,

  text_fade_duration:
    700,

  video_load_delay:
    1800,

  overlay_opacity:
    35,
});

const createCampaignForm = () => ({
  ...createHeroForm(),

  name:
    "",

  status:
    "SCHEDULED",

  is_enabled:
    true,

  priority:
    500,

  start_at:
    "",

  end_at:
    "",

  timezone:
    DEFAULT_TIMEZONE,
});

/* =========================================================
   HELPERS
========================================================= */

const getData = (
  response
) =>
  response?.data ??
  response ??
  null;

const getErrorMessage = (
  error,
  fallback
) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const formatLabel = (
  value = ""
) =>
  String(value)
    .replace(
      /_/g,
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );

const toDateTimeLocal = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const pad = (
    valueToPad
  ) =>
    String(
      valueToPad
    ).padStart(
      2,
      "0"
    );

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(
    date.getDate()
  )}T${pad(
    date.getHours()
  )}:${pad(
    date.getMinutes()
  )}`;
};

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString();
};

const statusColor = (
  status
) => {
  if (
    status === "LIVE" ||
    status === "ACTIVE"
  ) {
    return "success";
  }

  if (
    status === "FORCED"
  ) {
    return "error";
  }

  if (
    status === "UPCOMING"
  ) {
    return "info";
  }

  if (
    status === "DRAFT"
  ) {
    return "warning";
  }

  return "default";
};

const getUploadDescriptor = (
  response
) => {
  const data =
    getData(response);

  if (
    Array.isArray(data)
  ) {
    return data[0];
  }

  if (
    Array.isArray(
      data?.files
    )
  ) {
    return data.files[0];
  }

  return data;
};

const getUploadUrl = (
  data
) =>
  data?.uploadUrl ||
  data?.upload_url ||
  data?.presignedUrl ||
  data?.presigned_url ||
  "";

const getPublicUrl = (
  data
) =>
  data?.secure_url ||
  data?.secureUrl ||
  data?.publicUrl ||
  data?.publicURL ||
  data?.public_url ||
  data?.fileUrl ||
  data?.fileURL ||
  data?.file_url ||
  data?.cdnUrl ||
  data?.cdnURL ||
  data?.cdn_url ||
  data?.url ||
  "";

const updateField = (
  setter,
  field,
  value
) => {
  setter(
    (current) => ({
      ...current,

      [field]:
        value,
    })
  );
};

/* =========================================================
   MEDIA PREVIEW
========================================================= */

const MediaPreview = ({
  form,
}) => {
  if (
    !form.media_url
  ) {
    return (
      <Box
        sx={{
          minHeight:
            220,

          border:
            "1px dashed",

          borderColor:
            "divider",

          borderRadius:
            2,

          display:
            "grid",

          placeItems:
            "center",
        }}
      >
        <Typography
          color="text.secondary"
        >
          No media uploaded
        </Typography>
      </Box>
    );
  }

  if (
    form.media_type ===
    "VIDEO"
  ) {
    return (
      <Box
        component="video"
        src={
          form.media_url
        }
        poster={
          form.poster_url ||
          undefined
        }
        controls
        muted
        playsInline
        sx={{
          width:
            "100%",

          height:
            280,

          objectFit:
            "cover",

          borderRadius:
            2,

          bgcolor:
            "#000",
        }}
      />
    );
  }

  return (
    <Box
      component="img"
      src={
        form.media_url
      }
      alt={
        form.alt_text ||
        "Hero preview"
      }
      sx={{
        width:
          "100%",

        height:
          280,

        objectFit:
          "cover",

        borderRadius:
          2,
      }}
    />
  );
};

MediaPreview.propTypes = {
  form:
    PropTypes.shape({
      media_type:
        PropTypes.string,

      media_url:
        PropTypes.string,

      poster_url:
        PropTypes.string,

      alt_text:
        PropTypes.string,
    }).isRequired,
};

/* =========================================================
   HERO CONTENT FIELDS
========================================================= */

const HeroContentFields = ({
  form,
  setForm,
}) => {
  const keepTextVisible =
    Boolean(
      form.keep_text_visible
    );

  const timingFields = [
    {
      field:
        "text_start_delay",

      label:
        "Text Start Delay",
    },

    {
      field:
        "text_animation_duration",

      label:
        "Animation Duration",
    },

    {
      field:
        "description_delay",

      label:
        "Description Delay",
    },

    {
      field:
        "text_visible_duration",

      label:
        "Text Visible Duration",

      disabled:
        keepTextVisible,
    },

    {
      field:
        "text_fade_duration",

      label:
        "Text Fade Duration",

      disabled:
        keepTextVisible,
    },

    {
      field:
        "video_load_delay",

      label:
        "Video Load Delay",
    },
  ];

  return (
    <Grid
      container
      spacing={2}
    >
      <Grid
        item
        xs={12}
      >
        <TextField
          fullWidth
          required
          label="Heading"
          value={
            form.heading ||
            ""
          }
          onChange={(
            event
          ) =>
            updateField(
              setForm,
              "heading",
              event.target.value
            )
          }
        />
      </Grid>

      <Grid
        item
        xs={12}
      >
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Description"
          value={
            form.description ||
            ""
          }
          onChange={(
            event
          ) =>
            updateField(
              setForm,
              "description",
              event.target.value
            )
          }
        />
      </Grid>

      <Grid
        item
        xs={12}
        md={6}
      >
        <FormControl
          fullWidth
        >
          <InputLabel>
            Text Animation
          </InputLabel>

          <Select
            value={
              form.text_animation ||
              "SLIDE_UP"
            }
            label="Text Animation"
            onChange={(
              event
            ) =>
              updateField(
                setForm,
                "text_animation",
                event.target.value
              )
            }
          >
            {ANIMATIONS.map(
              (
                animation
              ) => (
                <MenuItem
                  key={
                    animation
                  }
                  value={
                    animation
                  }
                >
                  {formatLabel(
                    animation
                  )}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </Grid>

      <Grid
        item
        xs={12}
        md={6}
      >
        <TextField
          fullWidth
          type="number"
          label="Overlay Opacity"
          value={
            form.overlay_opacity
          }
          inputProps={{
            min: 0,
            max: 100,
          }}
          onChange={(
            event
          ) =>
            updateField(
              setForm,
              "overlay_opacity",
              event.target.value
            )
          }
        />
      </Grid>

      {/* =================================================
          KEEP TEXT VISIBLE
      ================================================= */}

      <Grid
        item
        xs={12}
      >
        <Box
          sx={{
            border:
              "1px solid",

            borderColor:
              keepTextVisible
                ? "primary.main"
                : "divider",

            borderRadius:
              2,

            px:
              2,

            py:
              1.25,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
              >
                Keep Text Always Visible
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                When enabled, heading and description will not fade out.
              </Typography>
            </Box>

            <Switch
              checked={
                keepTextVisible
              }
              onChange={(
                event
              ) =>
                updateField(
                  setForm,
                  "keep_text_visible",
                  event.target.checked
                )
              }
            />
          </Stack>
        </Box>
      </Grid>

      {timingFields.map(
        ({
          field,
          label,
          disabled = false,
        }) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={
              field
            }
          >
            <TextField
              fullWidth
              type="number"
              label={
                label
              }
              value={
                form[field]
              }
              disabled={
                disabled
              }
              inputProps={{
                min: 0,
              }}
              helperText={
                disabled
                  ? "Ignored while text stays visible"
                  : "Milliseconds"
              }
              onChange={(
                event
              ) =>
                updateField(
                  setForm,
                  field,
                  event.target.value
                )
              }
            />
          </Grid>
        )
      )}
    </Grid>
  );
};

HeroContentFields.propTypes = {
  form:
    PropTypes.shape({
      heading:
        PropTypes.string,

      description:
        PropTypes.string,

      text_animation:
        PropTypes.string,

      keep_text_visible:
        PropTypes.bool,

      overlay_opacity:
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),

      text_start_delay:
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),

      text_animation_duration:
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),

      description_delay:
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),

      text_visible_duration:
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),

      text_fade_duration:
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),

      video_load_delay:
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
    }).isRequired,

  setForm:
    PropTypes.func
      .isRequired,
};

/* =========================================================
   HERO MEDIA FIELDS
========================================================= */

const HeroMediaFields = ({
  form,
  setForm,
  uploadType,
  uploadingField,
  onUpload,
}) => {
  const uploadButton = (
    field,
    label,
    accept
  ) => (
    <Button
      component="label"
      variant="outlined"
      startIcon={
        uploadingField ===
        field
          ? (
            <CircularProgress
              size={18}
            />
          )
          : (
            <Iconify icon="eva:upload-fill" />
          )
      }
      disabled={
        Boolean(
          uploadingField
        )
      }
    >
      {label}

      <input
        hidden
        type="file"
        accept={
          accept
        }
        onChange={(
          event
        ) => {
          const file =
            event
              .target
              .files?.[0];

          event.target.value =
            "";

          if (file) {
            onUpload({
              file,
              field,

              type:
                uploadType,

              setter:
                setForm,
            });
          }
        }}
      />
    </Button>
  );

  return (
    <Grid
      container
      spacing={2}
    >
      <Grid
        item
        xs={12}
        md={4}
      >
        <FormControl
          fullWidth
        >
          <InputLabel>
            Media Type
          </InputLabel>

          <Select
            value={
              form.media_type ||
              "IMAGE"
            }
            label="Media Type"
            onChange={(
              event
            ) =>
              updateField(
                setForm,
                "media_type",
                event.target.value
              )
            }
          >
            {MEDIA_TYPES.map(
              (
                type
              ) => (
                <MenuItem
                  key={
                    type
                  }
                  value={
                    type
                  }
                >
                  {type}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </Grid>

      <Grid
        item
        xs={12}
        md={8}
      >
        <TextField
          fullWidth
          label="Alt Text"
          value={
            form.alt_text ||
            ""
          }
          onChange={(
            event
          ) =>
            updateField(
              setForm,
              "alt_text",
              event.target.value
            )
          }
        />
      </Grid>

      <Grid
        item
        xs={12}
      >
        <TextField
          fullWidth
          label="Desktop Media URL"
          value={
            form.media_url ||
            ""
          }
          onChange={(
            event
          ) =>
            updateField(
              setForm,
              "media_url",
              event.target.value
            )
          }
        />
      </Grid>

      <Grid
        item
        xs={12}
      >
        {uploadButton(
          "media_url",
          "Upload Desktop Media",
          form.media_type ===
          "VIDEO"
            ? "video/*"
            : "image/*"
        )}
      </Grid>

      {form.media_type ===
        "VIDEO" && (
        <>
          <Grid
            item
            xs={12}
          >
            <TextField
              fullWidth
              label="Desktop Poster URL"
              value={
                form.poster_url ||
                ""
              }
              onChange={(
                event
              ) =>
                updateField(
                  setForm,
                  "poster_url",
                  event.target.value
                )
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
          >
            {uploadButton(
              "poster_url",
              "Upload Desktop Poster",
              "image/*"
            )}
          </Grid>
        </>
      )}

      <Grid
        item
        xs={12}
      >
        <Divider>
          Mobile
        </Divider>
      </Grid>

      <Grid
        item
        xs={12}
      >
        <TextField
          fullWidth
          label="Mobile Media URL"
          value={
            form.mobile_media_url ||
            ""
          }
          helperText="Optional. Desktop media is used when empty."
          onChange={(
            event
          ) =>
            updateField(
              setForm,
              "mobile_media_url",
              event.target.value
            )
          }
        />
      </Grid>

      <Grid
        item
        xs={12}
      >
        {uploadButton(
          "mobile_media_url",
          "Upload Mobile Media",
          form.media_type ===
          "VIDEO"
            ? "video/*"
            : "image/*"
        )}
      </Grid>

      {form.media_type ===
        "VIDEO" && (
        <>
          <Grid
            item
            xs={12}
          >
            <TextField
              fullWidth
              label="Mobile Poster URL"
              value={
                form.mobile_poster_url ||
                ""
              }
              onChange={(
                event
              ) =>
                updateField(
                  setForm,
                  "mobile_poster_url",
                  event.target.value
                )
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
          >
            {uploadButton(
              "mobile_poster_url",
              "Upload Mobile Poster",
              "image/*"
            )}
          </Grid>
        </>
      )}
    </Grid>
  );
};

HeroMediaFields.propTypes = {
  form:
    PropTypes.shape({
      media_type:
        PropTypes.string,

      media_url:
        PropTypes.string,

      poster_url:
        PropTypes.string,

      mobile_media_url:
        PropTypes.string,

      mobile_poster_url:
        PropTypes.string,

      alt_text:
        PropTypes.string,
    }).isRequired,

  setForm:
    PropTypes.func
      .isRequired,

  uploadType:
    PropTypes.oneOf([
      "default",
      "campaign",
      "holiday",
    ]).isRequired,

  uploadingField:
    PropTypes.string,

  onUpload:
    PropTypes.func
      .isRequired,
};

/* =========================================================
   HOME SCREEN
========================================================= */

const HomeScreen = () => {
  const [
    tab,
    setTab,
  ] =
    useState(0);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    uploadingField,
    setUploadingField,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    activeHero,
    setActiveHero,
  ] =
    useState(null);

  const [
    defaultHero,
    setDefaultHero,
  ] =
    useState(
      createHeroForm()
    );

  const [
    campaigns,
    setCampaigns,
  ] =
    useState([]);

  const [
    holidays,
    setHolidays,
  ] =
    useState([]);

  const [
    campaignDialog,
    setCampaignDialog,
  ] =
    useState(false);

  const [
    campaignForm,
    setCampaignForm,
  ] =
    useState(
      createCampaignForm()
    );

  const [
    campaignId,
    setCampaignId,
  ] =
    useState(null);

  const [
    holidayDialog,
    setHolidayDialog,
  ] =
    useState(false);

  const [
    holidayForm,
    setHolidayForm,
  ] =
    useState(null);

  /* =======================================================
     LOAD
  ======================================================= */

  const fetchData =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setError(
          ""
        );

        try {
          const [
            defaultResponse,
            campaignResponse,
            holidayResponse,
            activeResponse,
          ] =
            await Promise.all([
              getDefaultHomeHero(),
              getHomeHeroCampaigns(),
              getHomeHeroHolidays(),
              getActiveHomeHero(),
            ]);

          setDefaultHero({
            ...createHeroForm(),

            ...getData(
              defaultResponse
            ),
          });

          setCampaigns(
            getData(
              campaignResponse
            ) || []
          );

          setHolidays(
            getData(
              holidayResponse
            ) || []
          );

          setActiveHero(
            getData(
              activeResponse
            )
          );
        } catch (
          fetchError
        ) {
          setError(
            getErrorMessage(
              fetchError,
              "Failed to load homepage hero settings."
            )
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(
    () => {
      fetchData();
    },
    [
      fetchData,
    ]
  );

  /* =======================================================
     ACTIVE
  ======================================================= */

  const refreshActive =
    async () => {
      const response =
        await getActiveHomeHero();

      setActiveHero(
        getData(
          response
        )
      );
    };

  /* =======================================================
     UPLOAD
  ======================================================= */

  const handleUpload =
    async ({
      file,
      field,
      type,
      setter,
    }) => {
      setUploadingField(
        field
      );

      setError(
        ""
      );

      try {
        const response =
          await createHomeHeroUploadUrls({
            type,

            files: [
              {
                fileName:
                  file.name,

                contentType:
                  file.type,
              },
            ],
          });

        const descriptor =
          getUploadDescriptor(
            response
          );

        const uploadUrl =
          getUploadUrl(
            descriptor
          );

        const publicUrl =
          getPublicUrl(
            descriptor
          );

        if (
          !uploadUrl ||
          !publicUrl
        ) {
          throw new Error(
            "Invalid upload response from server."
          );
        }

        await uploadHomeHeroMediaToR2({
          uploadUrl,
          file,

          contentType:
            file.type,
        });

        updateField(
          setter,
          field,
          publicUrl
        );

        setSuccess(
          "Media uploaded successfully."
        );
      } catch (
        uploadError
      ) {
        setError(
          getErrorMessage(
            uploadError,
            "Upload failed."
          )
        );
      } finally {
        setUploadingField(
          ""
        );
      }
    };

  /* =======================================================
     DEFAULT
  ======================================================= */

  const saveDefault =
    async () => {
      if (
        !defaultHero.heading ||
        !defaultHero.media_url
      ) {
        setError(
          "Heading and media are required."
        );

        return;
      }

      setSaving(
        true
      );

      setError(
        ""
      );

      try {
        const response =
          await updateDefaultHomeHero(
            defaultHero
          );

        setDefaultHero({
          ...createHeroForm(),

          ...getData(
            response
          ),
        });

        setSuccess(
          "Default hero saved successfully."
        );

        await refreshActive();
      } catch (
        saveError
      ) {
        setError(
          getErrorMessage(
            saveError,
            "Failed to save default hero."
          )
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* =======================================================
     CAMPAIGNS
  ======================================================= */

  const openCampaign =
    (
      campaign = null
    ) => {
      if (campaign) {
        setCampaignId(
          campaign.id
        );

        setCampaignForm({
          ...createCampaignForm(),

          ...campaign,

          start_at:
            toDateTimeLocal(
              campaign.start_at
            ),

          end_at:
            toDateTimeLocal(
              campaign.end_at
            ),
        });
      } else {
        setCampaignId(
          null
        );

        setCampaignForm(
          createCampaignForm()
        );
      }

      setCampaignDialog(
        true
      );
    };

  const saveCampaign =
    async () => {
      if (
        !campaignForm.name ||
        !campaignForm.heading ||
        !campaignForm.media_url ||
        !campaignForm.start_at ||
        !campaignForm.end_at
      ) {
        setError(
          "Campaign name, heading, media, start date and end date are required."
        );

        return;
      }

      setSaving(
        true
      );

      setError(
        ""
      );

      try {
        const payload = {
          ...campaignForm,

          start_at:
            new Date(
              campaignForm.start_at
            ).toISOString(),

          end_at:
            new Date(
              campaignForm.end_at
            ).toISOString(),
        };

        if (
          campaignId
        ) {
          await updateHomeHeroCampaign(
            campaignId,
            payload
          );
        } else {
          await createHomeHeroCampaign(
            payload
          );
        }

        setCampaignDialog(
          false
        );

        setSuccess(
          campaignId
            ? "Campaign updated."
            : "Campaign created."
        );

        const response =
          await getHomeHeroCampaigns();

        setCampaigns(
          getData(
            response
          ) || []
        );

        await refreshActive();
      } catch (
        saveError
      ) {
        setError(
          getErrorMessage(
            saveError,
            "Failed to save campaign."
          )
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  const toggleCampaign =
    async (
      campaign
    ) => {
      try {
        await toggleHomeHeroCampaign(
          campaign.id,
          !campaign.is_enabled
        );

        const response =
          await getHomeHeroCampaigns();

        setCampaigns(
          getData(
            response
          ) || []
        );

        await refreshActive();
      } catch (
        toggleError
      ) {
        setError(
          getErrorMessage(
            toggleError,
            "Failed to toggle campaign."
          )
        );
      }
    };

  const removeCampaign =
    async (
      id
    ) => {
      if (
        !window.confirm(
          "Delete this campaign?"
        )
      ) {
        return;
      }

      try {
        await deleteHomeHeroCampaign(
          id
        );

        setCampaigns(
          (
            current
          ) =>
            current.filter(
              (
                item
              ) =>
                item.id !==
                id
            )
        );

        await refreshActive();
      } catch (
        deleteError
      ) {
        setError(
          getErrorMessage(
            deleteError,
            "Failed to delete campaign."
          )
        );
      }
    };

  /* =======================================================
     HOLIDAYS
  ======================================================= */

  const openHoliday =
    (
      holiday
    ) => {
      setHolidayForm({
        ...createHeroForm(),

        ...holiday,

        custom_start_offset_hours:
          holiday
            .custom_start_offset_hours ??
          "",

        custom_end_offset_hours:
          holiday
            .custom_end_offset_hours ??
          "",
      });

      setHolidayDialog(
        true
      );
    };

  const saveHoliday =
    async () => {
      if (
        !holidayForm
      ) {
        return;
      }

      setSaving(
        true
      );

      setError(
        ""
      );

      try {
        const response =
          await updateHomeHeroHoliday(
            holidayForm.id,
            holidayForm
          );

        const updated =
          getData(
            response
          );

        setHolidays(
          (
            current
          ) =>
            current.map(
              (
                holiday
              ) =>
                holiday.id ===
                updated.id
                  ? updated
                  : holiday
            )
        );

        setHolidayDialog(
          false
        );

        setSuccess(
          "Holiday hero updated."
        );

        await refreshActive();
      } catch (
        saveError
      ) {
        setError(
          getErrorMessage(
            saveError,
            "Failed to save holiday."
          )
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  const toggleHoliday =
    async (
      holiday
    ) => {
      setError(
        ""
      );

      try {
        await toggleHomeHeroHoliday(
          holiday.id,
          !holiday.is_enabled
        );

        const response =
          await getHomeHeroHolidays();

        setHolidays(
          getData(
            response
          ) || []
        );

        await refreshActive();
      } catch (
        toggleError
      ) {
        setError(
          getErrorMessage(
            toggleError,
            "Failed to toggle holiday."
          )
        );
      }
    };

  /* =======================================================
     FORCE HOLIDAY
  ======================================================= */

  const handleForceHoliday =
    async (
      holiday
    ) => {
      setError(
        ""
      );

      setSuccess(
        ""
      );

      try {
        const forceActive =
          !holiday.force_active;

        await forceHomeHeroHoliday(
          holiday.id,
          forceActive
        );

        const [
          holidayResponse,
          activeResponse,
        ] =
          await Promise.all([
            getHomeHeroHolidays(),
            getActiveHomeHero(),
          ]);

        setHolidays(
          getData(
            holidayResponse
          ) || []
        );

        setActiveHero(
          getData(
            activeResponse
          )
        );

        setSuccess(
          forceActive
            ? `${holiday.name} is now forced live on the homepage.`
            : "Force Live disabled. Automatic scheduling restored."
        );
      } catch (
        forceError
      ) {
        setError(
          getErrorMessage(
            forceError,
            "Failed to update Force Live."
          )
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {
    return (
      <Box
        sx={{
          minHeight:
            500,

          display:
            "grid",

          placeItems:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
      }}
    >
      <Stack
        direction={{
          xs:
            "column",

          md:
            "row",
        }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Homepage Hero
          </Typography>

          <Typography
            color="text.secondary"
          >
            Manage default, campaign and holiday homepage heroes.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <Iconify icon="ic:round-refresh" />
          }
          onClick={
            fetchData
          }
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError("")
          }
          sx={{
            mb: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() =>
            setSuccess("")
          }
          sx={{
            mb: 2,
          }}
        >
          {success}
        </Alert>
      )}

      {/* ===================================================
          CURRENT LIVE
      =================================================== */}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Stack
            direction={{
              xs:
                "column",

              md:
                "row",
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
              >
                Currently Live
              </Typography>

              <Typography
                variant="h6"
                fontWeight={700}
              >
                {activeHero?.name ||
                  activeHero?.heading ||
                  "Default Hero"}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                label={
                  activeHero?.source_type ||
                  "DEFAULT"
                }
              />

              {activeHero?.keep_text_visible && (
                <Chip
                  label="TEXT ALWAYS VISIBLE"
                  color="info"
                  variant="outlined"
                />
              )}

              {activeHero?.force_active && (
                <Chip
                  label="FORCE LIVE"
                  color="error"
                />
              )}

              {activeHero?.runtime_status && (
                <Chip
                  label={
                    activeHero.runtime_status
                  }
                  color={
                    statusColor(
                      activeHero.runtime_status
                    )
                  }
                />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================
          TABS
      =================================================== */}

      <Card
        variant="outlined"
      >
        <Tabs
          value={
            tab
          }
          onChange={(
            event,
            value
          ) =>
            setTab(
              value
            )
          }
        >
          <Tab
            label="Default Hero"
          />

          <Tab
            label={`Campaigns (${campaigns.length})`}
          />

          <Tab
            label={`Holidays (${holidays.length})`}
          />
        </Tabs>

        <Divider />

        {/* =================================================
            DEFAULT
        ================================================= */}

        {tab === 0 && (
          <CardContent>
            <Stack
              direction={{
                xs:
                  "column",

                md:
                  "row",
              }}
              justifyContent="space-between"
              spacing={2}
              sx={{
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                >
                  Default Hero
                </Typography>

                <Typography
                  color="text.secondary"
                >
                  Permanent fallback hero.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={
                  saving
                    ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    )
                    : (
                      <Iconify icon="ic:round-save" />
                    )
                }
                disabled={
                  saving
                }
                onClick={
                  saveDefault
                }
              >
                Save
              </Button>
            </Stack>

            <Grid
              container
              spacing={3}
            >
              <Grid
                item
                xs={12}
                lg={5}
              >
                <MediaPreview
                  form={
                    defaultHero
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                lg={7}
              >
                <Stack
                  spacing={3}
                >
                  <HeroContentFields
                    form={
                      defaultHero
                    }
                    setForm={
                      setDefaultHero
                    }
                  />

                  <Divider>
                    Media
                  </Divider>

                  <HeroMediaFields
                    form={
                      defaultHero
                    }
                    setForm={
                      setDefaultHero
                    }
                    uploadType="default"
                    uploadingField={
                      uploadingField
                    }
                    onUpload={
                      handleUpload
                    }
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* =================================================
            CAMPAIGNS
        ================================================= */}

        {tab === 1 && (
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{
                mb: 3,
              }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
              >
                Campaigns
              </Typography>

              <Button
                variant="contained"
                startIcon={
                  <Iconify icon="eva:plus-fill" />
                }
                onClick={() =>
                  openCampaign()
                }
              >
                New Campaign
              </Button>
            </Stack>

            <Grid
              container
              spacing={2}
            >
              {campaigns.map(
                (
                  campaign
                ) => (
                  <Grid
                    item
                    xs={12}
                    md={6}
                    key={
                      campaign.id
                    }
                  >
                    <Card
                      variant="outlined"
                    >
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                            >
                              {
                                campaign.name
                              }
                            </Typography>

                            <Typography
                              color="text.secondary"
                              variant="body2"
                            >
                              {
                                campaign.heading
                              }
                            </Typography>
                          </Box>

                          <Stack
                            direction="row"
                          >
                            <IconButton
                              onClick={() =>
                                openCampaign(
                                  campaign
                                )
                              }
                            >
                              <Iconify icon="eva:edit-fill" />
                            </IconButton>

                            <IconButton
                              color="error"
                              onClick={() =>
                                removeCampaign(
                                  campaign.id
                                )
                              }
                            >
                              <Iconify icon="eva:trash-2-fill" />
                            </IconButton>
                          </Stack>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{
                            mt: 2,
                          }}
                        >
                          <Chip
                            size="small"
                            label={
                              campaign.runtime_status ||
                              campaign.status
                            }
                            color={
                              statusColor(
                                campaign.runtime_status
                              )
                            }
                          />

                          <Chip
                            size="small"
                            label={`Priority ${campaign.priority}`}
                            variant="outlined"
                          />

                          {campaign.keep_text_visible && (
                            <Chip
                              size="small"
                              label="Text Always Visible"
                              color="info"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        <Divider
                          sx={{
                            my: 2,
                          }}
                        />

                        <Typography
                          variant="body2"
                        >
                          Start:{" "}
                          {formatDate(
                            campaign.start_at
                          )}
                        </Typography>

                        <Typography
                          variant="body2"
                        >
                          End:{" "}
                          {formatDate(
                            campaign.end_at
                          )}
                        </Typography>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            mt: 2,
                          }}
                        >
                          <Typography>
                            Enabled
                          </Typography>

                          <Switch
                            checked={
                              Boolean(
                                campaign.is_enabled
                              )
                            }
                            onChange={() =>
                              toggleCampaign(
                                campaign
                              )
                            }
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </CardContent>
        )}

        {/* =================================================
            HOLIDAYS
        ================================================= */}

        {tab === 2 && (
          <CardContent>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mb: 3,
              }}
            >
              Holidays
            </Typography>

            <Alert
              severity="info"
              sx={{
                mb: 3,
              }}
            >
              Automatic follows the holiday schedule. Force Live overrides the date and shows that holiday immediately.
            </Alert>

            <Grid
              container
              spacing={2}
            >
              {holidays.map(
                (
                  holiday
                ) => (
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    key={
                      holiday.id
                    }
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        height:
                          "100%",

                        borderColor:
                          holiday.force_active
                            ? "error.main"
                            : "divider",
                      }}
                    >
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                            >
                              {
                                holiday.name
                              }
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatLabel(
                                holiday.event
                              )}
                            </Typography>
                          </Box>

                          <IconButton
                            onClick={() =>
                              openHoliday(
                                holiday
                              )
                            }
                          >
                            <Iconify icon="eva:edit-fill" />
                          </IconButton>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{
                            mt: 2,
                          }}
                        >
                          {holiday.is_live && (
                            <Chip
                              size="small"
                              label="LIVE"
                              color="success"
                            />
                          )}

                          {holiday.force_active && (
                            <Chip
                              size="small"
                              label="FORCED"
                              color="error"
                            />
                          )}

                          {holiday.keep_text_visible && (
                            <Chip
                              size="small"
                              label="Text Always Visible"
                              color="info"
                              variant="outlined"
                            />
                          )}

                          <Chip
                            size="small"
                            label={
                              formatLabel(
                                holiday.duration_mode
                              )
                            }
                            variant="outlined"
                          />

                          <Chip
                            size="small"
                            label={`Priority ${holiday.priority}`}
                            variant="outlined"
                          />
                        </Stack>

                        <Divider
                          sx={{
                            my: 2,
                          }}
                        />

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={2}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              Automatic
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Use scheduled holiday date
                            </Typography>
                          </Box>

                          <Switch
                            checked={
                              Boolean(
                                holiday.is_enabled
                              )
                            }
                            onChange={() =>
                              toggleHoliday(
                                holiday
                              )
                            }
                          />
                        </Stack>

                        <Divider
                          sx={{
                            my: 1.5,
                          }}
                        />

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={2}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color={
                                holiday.force_active
                                  ? "error.main"
                                  : "text.primary"
                              }
                            >
                              Force Live
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Show immediately regardless of date
                            </Typography>
                          </Box>

                          <Switch
                            color="error"
                            checked={
                              Boolean(
                                holiday.force_active
                              )
                            }
                            onChange={() =>
                              handleForceHoliday(
                                holiday
                              )
                            }
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </CardContent>
        )}
      </Card>

      {/* ===================================================
          CAMPAIGN DIALOG
      =================================================== */}

      <Dialog
        open={
          campaignDialog
        }
        onClose={() =>
          setCampaignDialog(
            false
          )
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {campaignId
            ? "Edit Campaign"
            : "Create Campaign"}
        </DialogTitle>

        <DialogContent
          dividers
        >
          <Stack
            spacing={3}
          >
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
                md={8}
              >
                <TextField
                  fullWidth
                  label="Campaign Name"
                  value={
                    campaignForm.name
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      setCampaignForm,
                      "name",
                      event.target.value
                    )
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={4}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Priority"
                  value={
                    campaignForm.priority
                  }
                  inputProps={{
                    min: 0,
                  }}
                  onChange={(
                    event
                  ) =>
                    updateField(
                      setCampaignForm,
                      "priority",
                      event.target.value
                    )
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <FormControl
                  fullWidth
                >
                  <InputLabel>
                    Status
                  </InputLabel>

                  <Select
                    value={
                      campaignForm.status
                    }
                    label="Status"
                    onChange={(
                      event
                    ) =>
                      updateField(
                        setCampaignForm,
                        "status",
                        event.target.value
                      )
                    }
                  >
                    {CAMPAIGN_STATUSES.map(
                      (
                        status
                      ) => (
                        <MenuItem
                          key={
                            status
                          }
                          value={
                            status
                          }
                        >
                          {formatLabel(
                            status
                          )}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  label="Timezone"
                  value={
                    campaignForm.timezone
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      setCampaignForm,
                      "timezone",
                      event.target.value
                    )
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Start"
                  InputLabelProps={{
                    shrink:
                      true,
                  }}
                  value={
                    campaignForm.start_at
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      setCampaignForm,
                      "start_at",
                      event.target.value
                    )
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="End"
                  InputLabelProps={{
                    shrink:
                      true,
                  }}
                  value={
                    campaignForm.end_at
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      setCampaignForm,
                      "end_at",
                      event.target.value
                    )
                  }
                />
              </Grid>
            </Grid>

            <HeroContentFields
              form={
                campaignForm
              }
              setForm={
                setCampaignForm
              }
            />

            <Divider>
              Media
            </Divider>

            <MediaPreview
              form={
                campaignForm
              }
            />

            <HeroMediaFields
              form={
                campaignForm
              }
              setForm={
                setCampaignForm
              }
              uploadType="campaign"
              uploadingField={
                uploadingField
              }
              onUpload={
                handleUpload
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={
                    Boolean(
                      campaignForm.is_enabled
                    )
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      setCampaignForm,
                      "is_enabled",
                      event.target.checked
                    )
                  }
                />
              }
              label="Enabled"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setCampaignDialog(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={
              saving
            }
            onClick={
              saveCampaign
            }
          >
            {saving
              ? "Saving..."
              : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===================================================
          HOLIDAY DIALOG
      =================================================== */}

      <Dialog
        open={
          holidayDialog
        }
        onClose={() =>
          setHolidayDialog(
            false
          )
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Edit Holiday
        </DialogTitle>

        <DialogContent
          dividers
        >
          {holidayForm && (
            <Stack
              spacing={3}
            >
              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <TextField
                    fullWidth
                    label="Name"
                    value={
                      holidayForm.name ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        setHolidayForm,
                        "name",
                        event.target.value
                      )
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={3}
                >
                  <TextField
                    fullWidth
                    type="number"
                    label="Priority"
                    value={
                      holidayForm.priority
                    }
                    inputProps={{
                      min: 0,
                    }}
                    onChange={(
                      event
                    ) =>
                      updateField(
                        setHolidayForm,
                        "priority",
                        event.target.value
                      )
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={3}
                >
                  <FormControl
                    fullWidth
                  >
                    <InputLabel>
                      Duration
                    </InputLabel>

                    <Select
                      value={
                        holidayForm.duration_mode
                      }
                      label="Duration"
                      onChange={(
                        event
                      ) =>
                        updateField(
                          setHolidayForm,
                          "duration_mode",
                          event.target.value
                        )
                      }
                    >
                      {DURATION_MODES.map(
                        (
                          mode
                        ) => (
                          <MenuItem
                            key={
                              mode
                            }
                            value={
                              mode
                            }
                          >
                            {formatLabel(
                              mode
                            )}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {holidayForm.duration_mode ===
                "CUSTOM" && (
                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      fullWidth
                      type="number"
                      label="Start Offset Hours"
                      value={
                        holidayForm
                          .custom_start_offset_hours
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          setHolidayForm,
                          "custom_start_offset_hours",
                          event.target.value
                        )
                      }
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      fullWidth
                      type="number"
                      label="End Offset Hours"
                      value={
                        holidayForm
                          .custom_end_offset_hours
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          setHolidayForm,
                          "custom_end_offset_hours",
                          event.target.value
                        )
                      }
                    />
                  </Grid>
                </Grid>
              )}

              <HeroContentFields
                form={
                  holidayForm
                }
                setForm={
                  setHolidayForm
                }
              />

              <Divider>
                Hero Media
              </Divider>

              <MediaPreview
                form={
                  holidayForm
                }
              />

              <HeroMediaFields
                form={
                  holidayForm
                }
                setForm={
                  setHolidayForm
                }
                uploadType="holiday"
                uploadingField={
                  uploadingField
                }
                onUpload={
                  handleUpload
                }
              />

              {holidayForm.event ===
                "NEW_YEAR" && (
                <>
                  <Divider>
                    Countdown
                  </Divider>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          Boolean(
                            holidayForm
                              .enable_countdown
                          )
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            setHolidayForm,
                            "enable_countdown",
                            event.target.checked
                          )
                        }
                      />
                    }
                    label="Enable New Year countdown"
                  />

                  {holidayForm.enable_countdown && (
                    <Grid
                      container
                      spacing={2}
                    >
                      <Grid
                        item
                        xs={12}
                      >
                        <TextField
                          fullWidth
                          label="Countdown Heading"
                          value={
                            holidayForm
                              .countdown_heading ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            updateField(
                              setHolidayForm,
                              "countdown_heading",
                              event.target.value
                            )
                          }
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                      >
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          label="Countdown Description"
                          value={
                            holidayForm
                              .countdown_description ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            updateField(
                              setHolidayForm,
                              "countdown_description",
                              event.target.value
                            )
                          }
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                      >
                        <TextField
                          fullWidth
                          label="Countdown Media URL"
                          value={
                            holidayForm
                              .countdown_media_url ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            updateField(
                              setHolidayForm,
                              "countdown_media_url",
                              event.target.value
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  )}
                </>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setHolidayDialog(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={
              saving
            }
            onClick={
              saveHoliday
            }
          >
            {saving
              ? "Saving..."
              : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HomeScreen;