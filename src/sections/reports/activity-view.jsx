import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Dialog,
  Divider,
  Collapse,
  TextField,
  Typography,
  IconButton,
  CardContent,
  DialogTitle,
  DialogContent,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { getActivities } from 'src/services/activity.service';

import Iconify from 'src/components/iconify';

const ACTION_COLORS = {
  CREATE: 'success',
  BULK_CREATE: 'success',

  UPDATE: 'warning',

  DELETE: 'error',
  BULK_DELETE: 'error',
};

const HIDDEN_FIELDS = [
  'password_hash',
  'created_at',
  'updated_at',
];

function prettifyField(field) {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ChangeCard({
  field,
  values,
}) {
  const oldValue =
    values?.old;

  const newValue =
    values?.new;

  /* =======================================================
     HELPERS
  ======================================================= */

  const isEmptyValue = (
    value,
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return true;
    }

    if (
      Array.isArray(value)
    ) {
      return value.length === 0;
    }

    if (
      typeof value ===
      "object" &&
      value !== null
    ) {
      return (
        Object.keys(value)
          .length === 0
      );
    }

    return false;
  };

  const normalizeArray = (
    value,
  ) =>
    Array.isArray(value)
      ? value
      : [];

  const formatSimpleValue = (
    value,
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    if (
      typeof value ===
      "boolean"
    ) {
      return value
        ? "Yes"
        : "No";
    }

    if (
      Array.isArray(value)
    ) {
      if (
        value.length === 0
      ) {
        return "None";
      }

      const isSimpleArray =
        value.every(
          (item) =>
            typeof item ===
            "string" ||
            typeof item ===
            "number" ||
            typeof item ===
            "boolean",
        );

      if (
        isSimpleArray
      ) {
        return value.join(
          ", ",
        );
      }

      return `${value.length} item${value.length === 1
          ? ""
          : "s"
        }`;
    }

    if (
      typeof value ===
      "object"
    ) {
      return JSON.stringify(
        value,
        null,
        2,
      );
    }

    return String(
      value,
    );
  };

  /* =======================================================
     IGNORE EMPTY FALSE-POSITIVE RELATIONS
  ======================================================= */

  /*
   * Example:
   *
   * OLD:
   * product_faqs = undefined
   *
   * NEW:
   * product_faqs = []
   *
   * This should NOT show as a real change.
   */

  if (
    field ===
    "product_faqs" &&
    isEmptyValue(
      oldValue,
    ) &&
    isEmptyValue(
      newValue,
    )
  ) {
    return null;
  }

  /* =======================================================
     MEDIA
  ======================================================= */

  if (
    field === "media"
  ) {
    const previousMedia =
      normalizeArray(
        oldValue,
      );

    const currentMedia =
      normalizeArray(
        newValue,
      );

    /*
     * If both sides are empty,
     * don't render anything.
     */

    if (
      previousMedia.length ===
      0 &&
      currentMedia.length ===
      0
    ) {
      return null;
    }

    /* =====================================================
       COMPARE MEDIA
    ===================================================== */

    const getMediaKey = (
      item,
    ) => {
      if (item?.id) {
        return `id-${item.id}`;
      }

      if (
        item?.public_id
      ) {
        return `public-${item.public_id}`;
      }

      return `url-${item?.media_url || ""}`;
    };

    const previousMap =
      new Map(
        previousMedia.map(
          (item) => [
            getMediaKey(
              item,
            ),
            item,
          ],
        ),
      );

    const currentMap =
      new Map(
        currentMedia.map(
          (item) => [
            getMediaKey(
              item,
            ),
            item,
          ],
        ),
      );

    const addedMedia =
      currentMedia.filter(
        (item) =>
          !previousMap.has(
            getMediaKey(
              item,
            ),
          ),
      );

    const removedMedia =
      previousMedia.filter(
        (item) =>
          !currentMap.has(
            getMediaKey(
              item,
            ),
          ),
      );

    /*
     * Existing media where something
     * about the media record changed.
     */

    const updatedMedia =
      currentMedia
        .filter((item) =>
          previousMap.has(
            getMediaKey(
              item,
            ),
          ),
        )
        .map((item) => {
          const oldItem =
            previousMap.get(
              getMediaKey(
                item,
              ),
            );

          const oldComparable =
          {
            media_url:
              oldItem?.media_url ||
              null,

            media_type:
              oldItem?.media_type ||
              null,

            alt_text:
              oldItem?.alt_text ||
              null,

            display_order:
              oldItem?.display_order ??
              null,
          };

          const newComparable =
          {
            media_url:
              item?.media_url ||
              null,

            media_type:
              item?.media_type ||
              null,

            alt_text:
              item?.alt_text ||
              null,

            display_order:
              item?.display_order ??
              null,
          };

          const changed =
            JSON.stringify(
              oldComparable,
            ) !==
            JSON.stringify(
              newComparable,
            );

          if (!changed) {
            return null;
          }

          return {
            old: oldItem,
            new: item,
          };
        })
        .filter(Boolean);

    /* =====================================================
       MEDIA CARD
    ===================================================== */

    const renderMediaItem = (

      item,

      status,

    ) => {

      const isVideo =

        item?.media_type ===

        "FEATURED_VIDEO" ||

        /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(

          item?.media_url || "",

        );

      let statusColor = "warning";

      let borderColor = "warning.light";

      let statusLabel = "Updated";

      if (status === "added") {

        statusColor = "success";

        borderColor = "success.light";

        statusLabel = "Added";

      }

      if (status === "removed") {

        statusColor = "error";

        borderColor = "error.light";

        statusLabel = "Removed";

      }
      return (
        <Card
          key={
            item?.id ||
            item?.public_id ||
            item?.media_url
          }
          variant="outlined"
          sx={{
            overflow:
              "hidden",

            borderColor,
          }}
        >
          {/* PREVIEW */}

          <Box
            sx={{
              width:
                "100%",

              aspectRatio:
                "4 / 3",

              bgcolor:
                "grey.100",

              overflow:
                "hidden",

              position:
                "relative",
            }}
          >
            {isVideo ? (
              <Box
                component="video"
                src={
                  item.media_url
                }
                muted
                preload="metadata"
                controls
                sx={{
                  width:
                    "100%",

                  height:
                    "100%",

                  objectFit:
                    "cover",

                  display:
                    "block",
                }}
              />
            ) : (
              <Box
                component="img"
                src={
                  item.media_url
                }
                alt={
                  item.alt_text ||
                  item.media_type ||
                  "Product media"
                }
                loading="lazy"
                sx={{
                  width:
                    "100%",

                  height:
                    "100%",

                  objectFit:
                    "cover",

                  display:
                    "block",
                }}
              />
            )}

            <Chip
              size="small"
              color={
                statusColor
              }
              label={
                statusLabel
              }
              sx={{
                position:
                  "absolute",

                top: 8,
                right: 8,

                fontSize:
                  10,
              }}
            />
          </Box>

          {/* INFO */}

          <CardContent
            sx={{
              p:
                "12px !important",
            }}
          >
            <Typography
              variant="body2"
              fontWeight={
                700
              }
            >
              {prettifyField(
                item?.media_type ||
                "Media",
              )}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{
                mt: 0.5,
              }}
            >
              ID:{" "}
              {item?.id ||
                "—"}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Display
              Order:{" "}
              {item?.display_order ??
                "—"}
            </Typography>

            {item?.alt_text && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{
                  mt: 0.5,
                }}
              >
                Alt:{" "}
                {
                  item.alt_text
                }
              </Typography>
            )}
          </CardContent>
        </Card>
      );
    };

    const renderMediaGrid = (
      media,
      status,
    ) => (
      <Box
        sx={{
          display:
            "grid",

          gridTemplateColumns: {
            xs:
              "repeat(1, minmax(0, 1fr))",

            sm:
              "repeat(2, minmax(0, 1fr))",

            md:
              "repeat(3, minmax(0, 1fr))",

            lg:
              "repeat(4, minmax(0, 1fr))",

            xl:
              "repeat(5, minmax(0, 1fr))",
          },

          gap: 2,
        }}
      >
        {media.map(
          (item) =>
            renderMediaItem(
              item,
              status,
            ),
        )}
      </Box>
    );

    return (
      <Card
        variant="outlined"
      >
        <CardContent>

          {/* HEADER */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs:
                "flex-start",
              sm:
                "center",
            }}
            spacing={2}
            mb={3}
          >
            <Box>
              <Typography
                variant="h6"
              >
                Media
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                {
                  currentMedia.length
                }{" "}
                current media{" "}
                {currentMedia.length ===
                  1
                  ? "item"
                  : "items"}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              {addedMedia.length >
                0 && (
                  <Chip
                    size="small"
                    color="success"
                    label={`+${addedMedia.length} Added`}
                  />
                )}

              {removedMedia.length >
                0 && (
                  <Chip
                    size="small"
                    color="error"
                    label={`-${removedMedia.length} Removed`}
                  />
                )}

              {updatedMedia.length >
                0 && (
                  <Chip
                    size="small"
                    color="warning"
                    label={`${updatedMedia.length} Updated`}
                  />
                )}

              {addedMedia.length ===
                0 &&
                removedMedia.length ===
                0 &&
                updatedMedia.length ===
                0 && (
                  <Chip
                    size="small"
                    label="No Changes"
                  />
                )}
            </Stack>
          </Stack>

          {/* ADDED */}

          {addedMedia.length >
            0 && (
              <Box
                sx={{
                  mb: 4,
                }}
              >
                <Typography
                  color="success.main"
                  fontWeight={
                    700
                  }
                  mb={2}
                >
                  Added Media
                </Typography>

                {renderMediaGrid(
                  addedMedia,
                  "added",
                )}
              </Box>
            )}

          {/* REMOVED */}

          {removedMedia.length >
            0 && (
              <Box
                sx={{
                  mb: 4,
                }}
              >
                <Typography
                  color="error.main"
                  fontWeight={
                    700
                  }
                  mb={2}
                >
                  Removed Media
                </Typography>

                {renderMediaGrid(
                  removedMedia,
                  "removed",
                )}
              </Box>
            )}

          {/* UPDATED */}

          {updatedMedia.length >
            0 && (
              <Box>
                <Typography
                  color="warning.main"
                  fontWeight={
                    700
                  }
                  mb={2}
                >
                  Updated Media
                </Typography>

                <Stack
                  spacing={3}
                >
                  {updatedMedia.map(
                    (
                      mediaChange,
                      index,
                    ) => (
                      <Box
                        key={
                          mediaChange
                            .new
                            ?.id ||
                          index
                        }
                      >
                        <Stack
                          direction={{
                            xs:
                              "column",
                            md:
                              "row",
                          }}
                          spacing={2}
                          alignItems="stretch"
                        >
                          <Box
                            flex={1}
                          >
                            <Typography
                              variant="caption"
                              color="error.main"
                              fontWeight={
                                700
                              }
                              display="block"
                              mb={1}
                            >
                              BEFORE
                            </Typography>

                            {renderMediaItem(
                              mediaChange.old,
                              "removed",
                            )}
                          </Box>

                          <Stack
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Iconify
                              icon="mdi:arrow-right"
                              width={26}
                              sx={{
                                color:
                                  "text.secondary",
                              }}
                            />
                          </Stack>

                          <Box
                            flex={1}
                          >
                            <Typography
                              variant="caption"
                              color="success.main"
                              fontWeight={
                                700
                              }
                              display="block"
                              mb={1}
                            >
                              AFTER
                            </Typography>

                            {renderMediaItem(
                              mediaChange.new,
                              "added",
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    ),
                  )}
                </Stack>
              </Box>
            )}

          {/* NO REAL MEDIA CHANGE */}

          {addedMedia.length ===
            0 &&
            removedMedia.length ===
            0 &&
            updatedMedia.length ===
            0 && (
              <Alert
                severity="info"
              >
                No actual
                media changes
                detected.
              </Alert>
            )}
        </CardContent>
      </Card>
    );
  }

  /* =======================================================
     PRODUCT FAQ
  ======================================================= */

  if (
    field ===
    "product_faqs"
  ) {
    const oldFaqs =
      normalizeArray(
        oldValue,
      );

    const newFaqs =
      normalizeArray(
        newValue,
      );

    /*
     * Missing old relation + empty
     * new relation = not a change.
     */

    if (
      oldFaqs.length ===
      0 &&
      newFaqs.length ===
      0
    ) {
      return null;
    }
  }

  /* =======================================================
     SEO
  ======================================================= */

  if (
    field ===
    "stone_product_seo"
  ) {
    /*
     * We cannot truthfully compare SEO if
     * the backend did not include SEO in
     * the old snapshot.
     *
     * Do not falsely show the existing
     * SEO object as "new".
     */

    if (
      oldValue === null ||
      oldValue ===
      undefined
    ) {
      return null;
    }

    const ignoredSeoFields =
      new Set([
        "id",
        "product_id",
        "created_at",
        "updated_at",
      ]);

    const oldSeo =
      typeof oldValue ===
        "object" &&
        oldValue !== null
        ? oldValue
        : {};

    const newSeo =
      typeof newValue ===
        "object" &&
        newValue !== null
        ? newValue
        : {};

    const seoFields =
      Array.from(
        new Set([
          ...Object.keys(
            oldSeo,
          ),

          ...Object.keys(
            newSeo,
          ),
        ]),
      ).filter(
        (key) =>
          !ignoredSeoFields.has(
            key,
          ),
      );

    const changedSeoFields =
      seoFields.filter(
        (key) =>
          JSON.stringify(
            oldSeo[key],
          ) !==
          JSON.stringify(
            newSeo[key],
          ),
      );

    if (
      changedSeoFields.length ===
      0
    ) {
      return null;
    }

    return (
      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography
              fontWeight={
                700
              }
            >
              Product SEO
            </Typography>

            <Chip
              size="small"
              color="warning"
              label={`${changedSeoFields.length} Changed`}
            />
          </Stack>

          <Stack
            spacing={3}
          >
            {changedSeoFields.map(
              (seoField) => (
                <Box
                  key={
                    seoField
                  }
                >
                  <Typography
                    variant="body2"
                    fontWeight={
                      700
                    }
                    mb={1}
                  >
                    {prettifyField(
                      seoField,
                    )}
                  </Typography>

                  <Stack
                    direction={{
                      xs:
                        "column",
                      md:
                        "row",
                    }}
                    spacing={2}
                  >
                    <Box
                      flex={1}
                      sx={{
                        p: 2,

                        borderRadius:
                          2,

                        bgcolor:
                          "#fff5f5",

                        border:
                          "1px solid",

                        borderColor:
                          "error.light",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="error.main"
                        fontWeight={
                          700
                        }
                      >
                        OLD VALUE
                      </Typography>

                      <Typography
                        sx={{
                          mt: 1,
                          whiteSpace:
                            "pre-wrap",
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {formatSimpleValue(
                          oldSeo[
                          seoField
                          ],
                        )}
                      </Typography>
                    </Box>

                    <Box
                      flex={1}
                      sx={{
                        p: 2,

                        borderRadius:
                          2,

                        bgcolor:
                          "#f0fff4",

                        border:
                          "1px solid",

                        borderColor:
                          "success.light",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="success.main"
                        fontWeight={
                          700
                        }
                      >
                        NEW VALUE
                      </Typography>

                      <Typography
                        sx={{
                          mt: 1,
                          whiteSpace:
                            "pre-wrap",
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {formatSimpleValue(
                          newSeo[
                          seoField
                          ],
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ),
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  /* =======================================================
     NORMAL FIELD
  ======================================================= */

  const oldFormatted =
    formatSimpleValue(
      oldValue,
    );

  const newFormatted =
    formatSimpleValue(
      newValue,
    );

  const oldIsObject =
    oldValue !== null &&
    typeof oldValue ===
    "object" &&
    !Array.isArray(
      oldValue,
    );

  const newIsObject =
    newValue !== null &&
    typeof newValue ===
    "object" &&
    !Array.isArray(
      newValue,
    );

  return (
    <Card
      variant="outlined"
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            fontWeight={
              700
            }
          >
            {prettifyField(
              field,
            )}
          </Typography>

          <Chip
            size="small"
            color="warning"
            label="Modified"
          />
        </Stack>

        <Stack
          direction={{
            xs:
              "column",
            md:
              "row",
          }}
          spacing={2}
        >

          {/* OLD */}

          <Box
            flex={1}
            sx={{
              p: 2,

              borderRadius:
                2,

              bgcolor:
                "#fff5f5",

              border:
                "1px solid",

              borderColor:
                "error.light",

              minWidth:
                0,
            }}
          >
            <Typography
              variant="caption"
              color="error.main"
              fontWeight={
                700
              }
            >
              OLD VALUE
            </Typography>

            {oldIsObject ? (
              <Box
                component="pre"
                sx={{
                  mt: 1.5,
                  mb: 0,

                  fontSize:
                    12,

                  lineHeight:
                    1.7,

                  whiteSpace:
                    "pre-wrap",

                  wordBreak:
                    "break-word",

                  overflow:
                    "auto",

                  maxHeight:
                    350,
                }}
              >
                {
                  oldFormatted
                }
              </Box>
            ) : (
              <Typography
                sx={{
                  mt: 1,

                  whiteSpace:
                    "pre-wrap",

                  wordBreak:
                    "break-word",
                }}
              >
                {
                  oldFormatted
                }
              </Typography>
            )}
          </Box>

          {/* NEW */}

          <Box
            flex={1}
            sx={{
              p: 2,

              borderRadius:
                2,

              bgcolor:
                "#f0fff4",

              border:
                "1px solid",

              borderColor:
                "success.light",

              minWidth:
                0,
            }}
          >
            <Typography
              variant="caption"
              color="success.main"
              fontWeight={
                700
              }
            >
              NEW VALUE
            </Typography>

            {newIsObject ? (
              <Box
                component="pre"
                sx={{
                  mt: 1.5,
                  mb: 0,

                  fontSize:
                    12,

                  lineHeight:
                    1.7,

                  whiteSpace:
                    "pre-wrap",

                  wordBreak:
                    "break-word",

                  overflow:
                    "auto",

                  maxHeight:
                    350,
                }}
              >
                {
                  newFormatted
                }
              </Box>
            ) : (
              <Typography
                sx={{
                  mt: 1,

                  whiteSpace:
                    "pre-wrap",

                  wordBreak:
                    "break-word",
                }}
              >
                {
                  newFormatted
                }
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
ChangeCard.propTypes = {
  field: PropTypes.string.isRequired,
  values: PropTypes.shape({
    old: PropTypes.any,
    new: PropTypes.any,
  }).isRequired,
};

export default function ActivityView() {
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModule = (moduleName) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: prev[moduleName] === false,
    }));
  };

  const filteredActivities = activities.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.created_by_name?.toLowerCase().includes(q) ||
      a.module_name?.toLowerCase().includes(q)
    );
  });

  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    const key = activity.module_name || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(activity);
    return acc;
  }, {});

  const getActivityProductName = (activity) =>
    activity?.new_values?.name ||
    activity?.old_values?.name ||
    activity?.product_name ||
    null;

  const getActivityCategoryName = (activity) =>
    activity?.new_values?.category_name ||
    activity?.old_values?.category_name ||
    activity?.category_name ||
    null;

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getActivities();
      setActivities(response?.data || response || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }


  const isCreateAction =
    selected?.action === 'CREATE';

  const isBulkCreateAction =
    selected?.action === 'BULK_CREATE';

  const isDeleteAction =
    selected?.action === 'DELETE';

  const isBulkDeleteAction =
    selected?.action === 'BULK_DELETE';
  return (
    <>
      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search by user or module..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" width={20} sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
          endAdornment: search && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearch('')}>
                <Iconify icon="eva:close-fill" width={16} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Grouped Activity List */}
      <Stack spacing={2}>
        {Object.keys(groupedActivities).length === 0 && (
          <Alert severity="info">No activity records found.</Alert>
        )}

        {Object.entries(groupedActivities).map(([moduleName, moduleActivities]) => {
          const isOpen = expandedModules[moduleName] !== false;

          return (
            <Card key={moduleName} variant="outlined">
              {/* Module Group Header */}
              <CardContent
                sx={{ cursor: 'pointer', py: '12px !important' }}
                onClick={() => toggleModule(moduleName)}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon="eva:layers-fill" width={18} sx={{ color: 'primary.main' }} />
                    <Typography fontWeight={700}>{moduleName}</Typography>
                    <Chip
                      label={`${moduleActivities.length} ${moduleActivities.length === 1 ? 'activity' : 'activities'}`}
                      size="small"
                      color="primary"
                      variant="soft"
                    />
                  </Stack>
                  <Iconify
                    icon={isOpen ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
                    width={20}
                    sx={{ color: 'text.secondary' }}
                  />
                </Stack>
              </CardContent>

              <Collapse in={isOpen}>
                <Divider />
                <Stack spacing={0}>
                  {moduleActivities.map((activity, idx) => (
                    <Box key={activity.id}>
                      <CardContent
                        sx={{
                          cursor: 'pointer',
                          transition: '0.2s',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => setSelected(activity)}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          flexWrap="wrap"
                          spacing={2}
                        >
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip
                              label={activity.action}
                              color={ACTION_COLORS[activity.action] || 'default'}
                              size="small"
                            />
                            <Box>
                              <Typography
                                fontWeight={700}
                                sx={{
                                  lineHeight: 1.2,
                                }}
                              >
                                {getActivityProductName(activity) ||
                                  prettifyField(activity.resource_type)}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {getActivityCategoryName(activity)
                                  ? `${getActivityCategoryName(activity)} · `
                                  : ""}

                                Product #{activity.resource_id || "-"}
                              </Typography>
                            </Box>
                          </Stack>

                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(activity.created_at), 'dd MMM yyyy hh:mm a')}
                          </Typography>
                        </Stack>

                        <Typography variant="body2" sx={{ mt: 1 }}>
                          By: <strong>{activity.created_by_name}</strong>
                        </Typography>

                        {activity.action === 'UPDATE' && activity.changed_fields && (
                          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                            Changed Fields: {Object.keys(activity.changed_fields).length}
                          </Typography>
                        )}
                      </CardContent>
                      {idx < moduleActivities.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Stack>
              </Collapse>
            </Card>
          );
        })}
      </Stack>

      {/* Detail Dialog */}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="xl"
      >
        {selected && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Activity Details</Typography>
                <IconButton onClick={() => setSelected(null)}>
                  <Iconify icon="eva:close-fill" width={20} />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                  gap: 2,
                  mb: 4,
                }}
              >
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">User</Typography>
                    <Typography fontWeight={600}>{selected.created_by_name}</Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Action</Typography>
                    <Box mt={1}>
                      <Chip
                        color={ACTION_COLORS[selected.action]}
                        label={selected.action}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Module</Typography>
                    <Typography fontWeight={600}>{selected.module_name}</Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Resource</Typography>
                    <Typography fontWeight={600}>
                      {selected.resource_type} #{selected.resource_id}
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">IP Address</Typography>
                    <Typography fontWeight={600}>{selected.ip_address}</Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography fontWeight={600}>
                      {format(new Date(selected.created_at), 'dd MMM yyyy hh:mm:ss a')}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {selected.action === 'UPDATE' && (
                <>
                  {selected.changed_fields && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Changed Fields ({Object.keys(selected.changed_fields).length})
                      </Typography>

                      <Stack spacing={2} mb={4}>
                        {Object.entries(selected.changed_fields)
                          .filter(([field]) => !HIDDEN_FIELDS.includes(field))
                          .map(([field, values]) => (
                            <ChangeCard key={field} field={field} values={values} />
                          ))}
                      </Stack>
                    </>
                  )}

                  <Typography variant="h6" gutterBottom>
                    Complete Record Comparison
                  </Typography>

                  <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                    <Card variant="outlined" sx={{ flex: 1, borderColor: 'error.light' }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                          <Chip label="OLD RECORD" color="error" size="small" />
                        </Stack>
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'grey.100',
                            overflow: 'auto',
                            maxHeight: 600,
                            fontSize: 12,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {JSON.stringify(selected.old_values, null, 2)}
                        </Box>
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ flex: 1, borderColor: 'success.light' }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                          <Chip label="NEW RECORD" color="success" size="small" />
                        </Stack>
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'grey.100',
                            overflow: 'auto',
                            maxHeight: 600,
                            fontSize: 12,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {JSON.stringify(selected.new_values, null, 2)}
                        </Box>
                      </CardContent>
                    </Card>
                  </Stack>
                </>
              )}


              {isCreateAction && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Created Record
                    </Typography>

                    <pre style={{ overflow: 'auto', maxHeight: 500 }}>
                      {JSON.stringify(selected.new_values, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {isBulkCreateAction && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Created Records ({selected.new_values?.count || 0})
                    </Typography>

                    <Stack spacing={1}>
                      {selected.new_values?.products?.map((product) => (
                        <Card key={product.id} variant="outlined">
                          <CardContent>
                            <Typography fontWeight={600}>
                              {product.name}
                            </Typography>
                            <Typography variant="body2">
                              {product.slug}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {isDeleteAction && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Deleted Record
                    </Typography>

                    <pre style={{ overflow: 'auto', maxHeight: 500 }}>
                      {JSON.stringify(selected.old_values, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
              {isBulkDeleteAction && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Deleted Records ({selected.new_values?.count || 0})
                    </Typography>

                    <Stack spacing={1}>
                      {selected.new_values?.products?.map((product) => (
                        <Card
                          key={product.id}
                          variant="outlined"
                          sx={{ borderColor: 'error.light' }}
                        >
                          <CardContent sx={{ py: 1.5 }}>
                            <Typography fontWeight={600}>
                              {product.name}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              ID: {product.id}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Slug: {product.slug}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}