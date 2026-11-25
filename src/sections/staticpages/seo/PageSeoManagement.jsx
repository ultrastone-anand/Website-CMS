import React, { useState, useEffect } from "react";

import {
  Box,
  Card,
  Grid,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  MenuItem,
  Container,
  TextField,
  Accordion,
  Typography,
  CardContent,
  LinearProgress,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";

import {
  getAllSeoRecords,
  updateSeoRecord,
  uploadPageImage,
} from "../../../services/pages.service";

// ============================================================
// CONSTANTS
// ============================================================

const BRAND_COLOR = "#c91f26";

const BRAND_BUTTON = {
  backgroundColor: BRAND_COLOR,
  "&:hover": {
    backgroundColor: "#aa1a20",
  },
};

const WEBSITE_URL = "https://www.ultrastones.com";

const SEO_FIELDS = [
  "meta_title",
  "meta_description",
  "canonical_url",
  "og_title",
  "og_description",
  "og_image_url",
  "seo_content",
];

// ============================================================
// HELPERS
// ============================================================

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const isConfigured = (record) =>
  Boolean(
    record?.meta_title?.trim() &&
    record?.meta_description?.trim()
  );

const normalizeSeo = (record = {}) => ({
  ...Object.fromEntries(
    SEO_FIELDS.map((key) => [
      key,
      record[key] ?? "",
    ])
  ),

  robots_index: record.robots_index || "index",

  robots_follow: record.robots_follow || "follow",

  schema_markup:
    typeof record.schema_markup === "string"
      ? record.schema_markup
      : JSON.stringify(
          record.schema_markup ?? {},
          null,
          2
        ),
});

const validateUrl = (value, label) => {
  if (!value.trim()) return;

  let url;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(
      `${label} must be a valid absolute URL.`
    );
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(
      `${label} must use HTTP or HTTPS.`
    );
  }
};

const parseSchema = (value) => {
  let schema;

  try {
    schema = JSON.parse(value.trim() || "{}");
  } catch {
    throw new Error(
      "Schema markup must contain valid JSON."
    );
  }

  if (!schema || typeof schema !== "object") {
    throw new Error(
      "Schema markup must be a JSON object or array."
    );
  }

  return schema;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const PageSeoManagement = () => {
  const [records, setRecords] = useState([]);

  const [selectedId, setSelectedId] = useState("");

  const [seo, setSeo] = useState(null);

  const [originalSeo, setOriginalSeo] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [expanded, setExpanded] =
    useState("openGraph");

  // ==========================================================
  // DERIVED VALUES
  // ==========================================================

  const selectedPage = records.find(
    (record) =>
      String(record.id) === String(selectedId)
  );

  const configuredCount =
    records.filter(isConfigured).length;

  const pendingCount =
    records.length - configuredCount;

  const completionPercentage = records.length
    ? Math.round(
        (configuredCount / records.length) * 100
      )
    : 0;

  const busy = saving || uploading || loading;

  const hasChanges =
    Boolean(seo && originalSeo) &&
    JSON.stringify(seo) !==
      JSON.stringify(originalSeo);

  const pageUrl = selectedPage?.route_path
    ? `${WEBSITE_URL}${selectedPage.route_path}`
    : "";

  // ==========================================================
  // LOAD SEO RECORDS
  // ==========================================================

  const fetchSeoRecords = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await getAllSeoRecords();

      const data = Array.isArray(response)
        ? response
        : response?.data;

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid SEO records response."
        );
      }

      if (data.some((record) => !Number.isSafeInteger(record?.id) || !Object.prototype.hasOwnProperty.call(record, "page_id") || !record.route_path || record.page_seo !== undefined)) {
        throw new Error("Expected centralized SEO records. Verify the backend supports mode=record.");
      }

      const sortedRecords = [...data].sort((a, b) =>
        (a.page_name || a.page_title || "").localeCompare(b.page_name || b.page_title || "")
      );

      setRecords(sortedRecords);

      const initialRecord =
        sortedRecords.find(
          (record) =>
            String(record.id) === String(selectedId)
        ) ||
        sortedRecords.find(
          (record) => !isConfigured(record)
        ) ||
        sortedRecords[0];

      if (initialRecord) {
        const values = normalizeSeo(initialRecord);

        setSelectedId(String(initialRecord.id));
        setSeo(values);
        setOriginalSeo({ ...values });
      } else {
        setSelectedId("");
        setSeo(null);
        setOriginalSeo(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================
  // UNSAVED CHANGES PROTECTION
  // ==========================================================

  useEffect(() => {
    if (!hasChanges) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [hasChanges]);

  // ==========================================================
  // SELECT PAGE
  // ==========================================================

  const handlePageChange = (event) => {
    const nextId = event.target.value;

    if (
      hasChanges &&
      !window.confirm(
        "You have unsaved SEO changes. Discard them?"
      )
    ) {
      return;
    }

    const record = records.find(
      (item) => String(item.id) === String(nextId)
    );

    if (!record) return;

    const values = normalizeSeo(record);

    setSelectedId(String(record.id));
    setSeo(values);
    setOriginalSeo({ ...values });
    setError("");
    setSuccess("");
  };

  // ==========================================================
  // CHANGE SEO FIELD
  // ==========================================================

  const changeSeo = (field, value) => {
    setSeo((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // RESET SEO
  // ==========================================================

  const handleReset = () => {
    if (!originalSeo || !hasChanges) return;

    const confirmed = window.confirm(
      "Discard all unsaved SEO changes?"
    );

    if (!confirmed) return;

    setSeo({ ...originalSeo });
    setError("");
    setSuccess("");
  };

  // ==========================================================
  // REFRESH RECORDS
  // ==========================================================

  const handleRefresh = () => {
    if (
      hasChanges &&
      !window.confirm(
        "Refreshing will discard unsaved changes. Continue?"
      )
    ) {
      return;
    }

    fetchSeoRecords();
  };

  // ==========================================================
  // FORMAT JSON-LD
  // ==========================================================

  const handleFormatSchema = () => {
    try {
      const schema = parseSchema(seo.schema_markup);

      changeSeo(
        "schema_markup",
        JSON.stringify(schema, null, 2)
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // ==========================================================
  // UPLOAD OPEN GRAPH IMAGE
  // ==========================================================

  const handleUploadOgImage = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const response = await uploadPageImage(file);

      const url =
        response?.data?.secure_url ||
        response?.secure_url;

      if (!url) {
        throw new Error(
          "Image uploaded but URL was not received."
        );
      }

      changeSeo("og_image_url", url);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  // ==========================================================
  // SAVE SEO
  // ==========================================================

  const handleSave = async () => {
    if (!selectedPage?.id || !seo || busy) return;

    try {
      setError("");
      setSuccess("");

      validateUrl(
        seo.canonical_url,
        "Canonical URL"
      );

      validateUrl(
        seo.og_image_url,
        "Open Graph image URL"
      );

      if (seo.meta_title.length > 255) {
        throw new Error(
          "Meta title cannot exceed 255 characters."
        );
      }

      if (seo.og_title.length > 255) {
        throw new Error(
          "Open Graph title cannot exceed 255 characters."
        );
      }

      const schema = parseSchema(
        seo.schema_markup
      );

      const payload = {
        ...Object.fromEntries(
          SEO_FIELDS.map((field) => [
            field,
            seo[field].trim(),
          ])
        ),

        robots_index: seo.robots_index,

        robots_follow: seo.robots_follow,

        schema_markup: schema,
      };

      setSaving(true);

      const response = await updateSeoRecord(
        selectedPage.id,
        payload
      );

      const updatedRecord =
        response?.data || response;

      if (
        !updatedRecord?.id ||
        String(updatedRecord.id) !==
          String(selectedPage.id) ||
        updatedRecord.page_id !== selectedPage.page_id
      ) {
        throw new Error(
          "SEO was submitted, but the saved record could not be verified. Refresh before retrying."
        );
      }

      const mergedRecord = {
        ...selectedPage,
        ...updatedRecord,
        id: selectedPage.id,
        page_id: selectedPage.page_id,
        page_name: updatedRecord.page_name || selectedPage.page_name,
        route_path: updatedRecord.route_path || selectedPage.route_path,
      };

      setRecords((previous) =>
        previous.map((record) =>
          record.id === selectedPage.id
            ? mergedRecord
            : record
        )
      );

      const normalized = normalizeSeo(
        mergedRecord
      );

      setSeo(normalized);
      setOriginalSeo({ ...normalized });

      setSuccess(
        `SEO settings for ${selectedPage.page_name} saved successfully.`
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // ACCORDION CONTROL
  // ==========================================================

  const handleAccordionChange =
    (panel) => (_, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress
            sx={{ color: BRAND_COLOR }}
          />

          <Typography color="text.secondary">
            Loading page SEO records...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* PAGE HEADER */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={600}
              mb={1}
            >
              Page SEO Management
            </Typography>

            <Box
              sx={{
                width: 70,
                height: 4,
                backgroundColor: BRAND_COLOR,
                mb: 2,
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Manage search engine metadata,
              canonical URLs, social sharing and
              structured data for website pages.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            disabled={busy}
            onClick={handleRefresh}
          >
            Refresh Records
          </Button>
        </Box>

        {/* STATUS MESSAGES */}

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess("")}
            sx={{ mb: 3 }}
          >
            {success}
          </Alert>
        )}

        {/* OVERVIEW CARDS */}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            {
              label: "Registered Website Pages",
              value: records.length,
              color: "text.primary",
              description: "Registered SEO records",
            },
            {
              label: "SEO Configured",
              value: configuredCount,
              color: "success.main",
              description: "Title and description added",
            },
            {
              label: "SEO Pending",
              value: pendingCount,
              color: "warning.main",
              description: "Metadata requires attention",
            },
            {
              label: "SEO Completion",
              value: `${completionPercentage}%`,
              color: BRAND_COLOR,
              description: "Metadata completion",
            },
          ].map((item) => (
            <Grid
              item
              xs={6}
              md={3}
              key={item.label}
            >
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={1}
                  >
                    {item.label}
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color={item.color}
                    mb={1}
                  >
                    {item.value}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* COMPLETION PROGRESS */}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1.5}
            >
              <Typography fontWeight={600}>
                SEO Configuration Progress
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {configuredCount} of {records.length}
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                height: 8,
                borderRadius: 5,
                backgroundColor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: BRAND_COLOR,
                  borderRadius: 5,
                },
              }}
            />
          </CardContent>
        </Card>

        {/* PAGE SELECTION */}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={1}
            >
              Select Website Page
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mb={3}
            >
              Choose a page to view and update its
              SEO configuration.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Website Page"
                  value={selectedId}
                  disabled={busy || !records.length}
                  onChange={handlePageChange}
                >
                  {records.map((record) => (
                    <MenuItem
                      key={record.id}
                      value={String(record.id)}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "space-between",
                          width: "100%",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                          >
                            {record.page_name ||
                              record.page_title ||
                              "Unnamed Page"}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {record.route_path}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={
                            isConfigured(record)
                              ? "Configured"
                              : "Pending"
                          }
                          color={
                            isConfigured(record)
                              ? "success"
                              : "warning"
                          }
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Frontend Route"
                  value={
                    selectedPage?.route_path || ""
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>

            {selectedPage && (
              <>
                <Divider sx={{ my: 3 }} />

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                  }}
                  spacing={2}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Chip
                      size="small"
                      label={
                        selectedPage.page_id == null
                          ? "Standalone Page"
                          : "CMS Managed Page"
                      }
                      variant="outlined"
                    />

                    <Chip
                      size="small"
                      label={
                        isConfigured(selectedPage)
                          ? "SEO Configured"
                          : "SEO Pending"
                      }
                      color={
                        isConfigured(selectedPage)
                          ? "success"
                          : "warning"
                      }
                    />

                    {hasChanges && (
                      <Chip
                        size="small"
                        label="Unsaved Changes"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {pageUrl && (
                    <Button
                      component="a"
                      href={pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      variant="outlined"
                    >
                      View Website Page
                    </Button>
                  )}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        {/* EMPTY STATE */}

        {!seo && (
          <Card>
            <CardContent
              sx={{
                textAlign: "center",
                py: 7,
              }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                mb={2}
              >
                No SEO records available
              </Typography>

              <Button
                variant="outlined"
                onClick={fetchSeoRecords}
              >
                Retry Loading
              </Button>
            </CardContent>
          </Card>
        )}

        {seo && selectedPage && (
          <>
            <Grid container spacing={3}>
              {/* LEFT COLUMN */}

              <Grid item xs={12} lg={7}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      mb={1}
                    >
                      Search Engine Metadata
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mb={3}
                    >
                      Configure how this page may
                      appear in search results.
                    </Typography>

                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Meta Title"
                        value={seo.meta_title}
                        disabled={busy}
                        onChange={(event) =>
                          changeSeo(
                            "meta_title",
                            event.target.value
                          )
                        }
                        helperText={`${seo.meta_title.length} characters · Suggested 50–60`}
                        FormHelperTextProps={{
                          sx: {
                            color:
                              seo.meta_title.length >
                              60
                                ? "warning.main"
                                : "text.secondary",
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Meta Description"
                        value={seo.meta_description}
                        disabled={busy}
                        onChange={(event) =>
                          changeSeo(
                            "meta_description",
                            event.target.value
                          )
                        }
                        helperText={`${seo.meta_description.length} characters · Suggested 150–160`}
                        FormHelperTextProps={{
                          sx: {
                            color:
                              seo.meta_description
                                .length > 160
                                ? "warning.main"
                                : "text.secondary",
                          },
                        }}
                      />

                      <Box>
                        <TextField
                          fullWidth
                          label="Canonical URL"
                          value={seo.canonical_url}
                          disabled={busy}
                          onChange={(event) =>
                            changeSeo(
                              "canonical_url",
                              event.target.value
                            )
                          }
                          helperText="Preferred URL for search engine indexing."
                        />

                        <Button
                          size="small"
                          disabled={busy || !pageUrl}
                          onClick={() =>
                            changeSeo(
                              "canonical_url",
                              pageUrl
                            )
                          }
                          sx={{ mt: 1 }}
                        >
                          Use Current Page URL
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* RIGHT COLUMN */}

              <Grid item xs={12} lg={5}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      mb={1}
                    >
                      Google Search Preview
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mb={3}
                    >
                      Preview how your metadata may
                      appear on Google.
                    </Typography>

                    <Box
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 2.5,
                        backgroundColor: "#fff",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        mb={1.5}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            backgroundColor:
                              BRAND_COLOR,
                            color: "#fff",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: 700,
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          US
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 14,
                              color: "#202124",
                            }}
                          >
                            Ultra Stones
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#4d5156",
                              overflowWrap:
                                "anywhere",
                            }}
                          >
                            {seo.canonical_url ||
                              pageUrl}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography
                        sx={{
                          color: "#1a0dab",
                          fontSize: 20,
                          lineHeight: 1.4,
                          mb: 1,
                          overflowWrap: "anywhere",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient:
                            "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {seo.meta_title ||
                          `${selectedPage.page_name} | Ultra Stones`}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 14,
                          lineHeight: 1.6,
                          color: "#4d5156",
                          overflowWrap: "anywhere",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient:
                            "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {seo.meta_description ||
                          "Your meta description will appear here when added."}
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mt={2}
                    >
                      Illustrative preview only.
                      Google may generate different
                      titles and descriptions.
                    </Typography>
                  </CardContent>
                </Card>

                {/* SEO CHECKLIST */}

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      mb={2}
                    >
                      Metadata Checklist
                    </Typography>

                    <Stack spacing={1.5}>
                      {[
                        {
                          label: "Meta title added",
                          valid: Boolean(
                            seo.meta_title.trim()
                          ),
                        },
                        {
                          label:
                            "Meta description added",
                          valid: Boolean(
                            seo.meta_description.trim()
                          ),
                        },
                        {
                          label: "Canonical URL added",
                          valid: Boolean(
                            seo.canonical_url.trim()
                          ),
                        },
                        {
                          label: "Open Graph image added",
                          valid: Boolean(
                            seo.og_image_url.trim()
                          ),
                        },
                        {
                          label: "Indexing enabled",
                          valid:
                            seo.robots_index ===
                            "index",
                        },
                      ].map((item) => (
                        <Stack
                          key={item.label}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography variant="body2">
                            {item.label}
                          </Typography>

                          <Chip
                            size="small"
                            label={
                              item.valid
                                ? "Complete"
                                : "Review"
                            }
                            color={
                              item.valid
                                ? "success"
                                : "warning"
                            }
                            variant="outlined"
                          />
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* ADVANCED SEO SETTINGS */}

            <Typography
              variant="h6"
              fontWeight={600}
              mb={2}
            >
              Advanced SEO Settings
            </Typography>

            {/* OPEN GRAPH */}

            <Accordion
              expanded={expanded === "openGraph"}
              onChange={handleAccordionChange(
                "openGraph"
              )}
              disableGutters
              sx={{ mb: 2 }}
            >
              <AccordionSummary
                expandIcon={
                  <Typography>⌄</Typography>
                }
              >
                <Box>
                  <Typography fontWeight={600}>
                    Open Graph / Social Sharing
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Control page appearance when
                    shared on social platforms.
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Open Graph Title"
                        value={seo.og_title}
                        disabled={busy}
                        onChange={(event) =>
                          changeSeo(
                            "og_title",
                            event.target.value
                          )
                        }
                      />

                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Open Graph Description"
                        value={seo.og_description}
                        disabled={busy}
                        onChange={(event) =>
                          changeSeo(
                            "og_description",
                            event.target.value
                          )
                        }
                      />

                      <TextField
                        fullWidth
                        label="Open Graph Image URL"
                        value={seo.og_image_url}
                        disabled={busy}
                        onChange={(event) =>
                          changeSeo(
                            "og_image_url",
                            event.target.value
                          )
                        }
                        helperText="Recommended image size: 1200 × 630 px."
                      />

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Button
                          component="label"
                          variant="outlined"
                          disabled={busy}
                        >
                          {uploading
                            ? "Uploading..."
                            : "Upload OG Image"}

                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={
                              handleUploadOgImage
                            }
                          />
                        </Button>

                        <Button
                          variant="text"
                          disabled={busy}
                          onClick={() => {
                            setSeo((previous) => ({
                              ...previous,
                              og_title:
                                previous.meta_title,
                              og_description:
                                previous.meta_description,
                            }));

                            setSuccess("");
                            setError("");
                          }}
                        >
                          Copy Meta Details
                        </Button>

                        {seo.og_image_url && (
                          <Button
                            color="error"
                            disabled={busy}
                            onClick={() =>
                              changeSeo(
                                "og_image_url",
                                ""
                              )
                            }
                          >
                            Remove Image
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Typography
                      variant="subtitle2"
                      mb={1.5}
                    >
                      Social Sharing Preview
                    </Typography>

                    <Card variant="outlined">
                      <Box
                        sx={{
                          aspectRatio: "1200 / 630",
                          backgroundColor:
                            "action.hover",
                          overflow: "hidden",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {seo.og_image_url ? (
                          <Box
                            component="img"
                            src={seo.og_image_url}
                            alt="Open Graph preview"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Typography
                            color="text.secondary"
                            variant="body2"
                          >
                            No social image selected
                          </Typography>
                        )}
                      </Box>

                      <CardContent>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          ULTRASTONES.COM
                        </Typography>

                        <Typography
                          fontWeight={600}
                          mt={0.5}
                          sx={{
                            overflowWrap:
                              "anywhere",
                          }}
                        >
                          {seo.og_title ||
                            seo.meta_title ||
                            selectedPage.page_name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={1}
                          sx={{
                            overflowWrap:
                              "anywhere",
                          }}
                        >
                          {seo.og_description ||
                            seo.meta_description ||
                            "Social description preview"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* ROBOTS CONFIGURATION */}

            <Accordion
              expanded={expanded === "robots"}
              onChange={handleAccordionChange(
                "robots"
              )}
              disableGutters
              sx={{ mb: 2 }}
            >
              <AccordionSummary
                expandIcon={
                  <Typography>⌄</Typography>
                }
              >
                <Box>
                  <Typography fontWeight={600}>
                    Robots Configuration
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Manage indexing and link-following
                    directives.
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Robots Index"
                      value={seo.robots_index}
                      disabled={busy}
                      onChange={(event) =>
                        changeSeo(
                          "robots_index",
                          event.target.value
                        )
                      }
                    >
                      <MenuItem value="index">
                        Index
                      </MenuItem>

                      <MenuItem value="noindex">
                        Noindex
                      </MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Robots Follow"
                      value={seo.robots_follow}
                      disabled={busy}
                      onChange={(event) =>
                        changeSeo(
                          "robots_follow",
                          event.target.value
                        )
                      }
                    >
                      <MenuItem value="follow">
                        Follow
                      </MenuItem>

                      <MenuItem value="nofollow">
                        Nofollow
                      </MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                {seo.robots_index === "noindex" && (
                  <Alert
                    severity="warning"
                    sx={{ mt: 3 }}
                  >
                    This page is configured as
                    noindex. Search engines may remove
                    it from search results after
                    processing this directive.
                  </Alert>
                )}

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: "action.hover",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Generated Robots Directive
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: 13,
                      mt: 1,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {`<meta name="robots" content="${seo.robots_index}, ${seo.robots_follow}" />`}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* STRUCTURED DATA */}

            <Accordion
              expanded={expanded === "schema"}
              onChange={handleAccordionChange(
                "schema"
              )}
              disableGutters
              sx={{ mb: 2 }}
            >
              <AccordionSummary
                expandIcon={
                  <Typography>⌄</Typography>
                }
              >
                <Box>
                  <Typography fontWeight={600}>
                    Structured Data / JSON-LD
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Manage Schema.org structured data.
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={12}
                    maxRows={25}
                    label="Schema Markup (JSON-LD)"
                    value={seo.schema_markup}
                    disabled={busy}
                    onChange={(event) =>
                      changeSeo(
                        "schema_markup",
                        event.target.value
                      )
                    }
                    InputProps={{
                      sx: {
                        fontFamily: "monospace",
                        fontSize: 13,
                      },
                    }}
                    helperText="Enter a valid JSON object or array without script tags."
                  />

                  <Stack
                    direction="row"
                    spacing={2}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Button
                      variant="outlined"
                      disabled={busy}
                      onClick={handleFormatSchema}
                    >
                      Format JSON
                    </Button>

                    <Button
                      component="a"
                      href="https://validator.schema.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Schema Validator
                    </Button>

                    <Button
                      component="a"
                      href="https://search.google.com/test/rich-results"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Rich Results Test
                    </Button>
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* SEO CONTENT */}

            <Accordion
              expanded={expanded === "seoContent"}
              onChange={handleAccordionChange(
                "seoContent"
              )}
              disableGutters
              sx={{ mb: 3 }}
            >
              <AccordionSummary
                expandIcon={
                  <Typography>⌄</Typography>
                }
              >
                <Box>
                  <Typography fontWeight={600}>
                    Additional SEO Content
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Manage supplementary page content.
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <TextField
                  fullWidth
                  multiline
                  minRows={8}
                  label="SEO Content"
                  value={seo.seo_content}
                  disabled={busy}
                  onChange={(event) =>
                    changeSeo(
                      "seo_content",
                      event.target.value
                    )
                  }
                  helperText={`${seo.seo_content.length} characters`}
                />
              </AccordionDetails>
            </Accordion>

            {/* STICKY SAVE BAR */}

            <Card
              sx={{
                position: "sticky",
                bottom: 16,
                zIndex: 10,
                boxShadow: 5,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent
                sx={{
                  "&:last-child": {
                    pb: 2,
                  },
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "stretch",
                    sm: "center",
                  }}
                  spacing={2}
                >
                  <Box>
                    <Typography
                      fontWeight={600}
                      variant="body2"
                    >
                      {selectedPage.page_name}
                    </Typography>

                    <Typography
                      variant="caption"
                      color={
                        hasChanges
                          ? "warning.main"
                          : "text.secondary"
                      }
                    >
                      {hasChanges
                        ? "You have unsaved changes"
                        : "No unsaved changes"}
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                  >
                    <Button
                      variant="outlined"
                      disabled={busy || !hasChanges}
                      onClick={handleReset}
                    >
                      Reset
                    </Button>

                    <Button
                      variant="contained"
                      disabled={busy || !hasChanges}
                      onClick={handleSave}
                      sx={{
                        ...BRAND_BUTTON,
                        px: 4,
                        py: 1.2,
                      }}
                    >
                      {saving ? (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <CircularProgress
                            size={18}
                            color="inherit"
                          />

                          <span>Saving...</span>
                        </Stack>
                      ) : (
                        "Save SEO Settings"
                      )}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
};

export default PageSeoManagement;