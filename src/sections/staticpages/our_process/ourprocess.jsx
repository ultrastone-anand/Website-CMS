import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";

import {
  Box,
  Card,
  Grid,
  Alert,
  Button,
  Divider,
  MenuItem,
  Container,
  TextField,
  Typography,
  CardContent,
  CircularProgress,
} from "@mui/material";

import {
  updatePage,
  getPageBySlug,
  updatePageSeo,
  getPageSeoById,
  uploadPageImage,
} from "../../../services/pages.service";

/* =========================================================
   SEO FIELDS
========================================================= */

const SEO_FIELDS = [
  ["meta_title", "Meta Title", 60],
  ["meta_description", "Meta Description", 160, 3],
  ["canonical_url", "Canonical URL"],
  ["og_title", "Open Graph Title"],
  ["og_description", "Open Graph Description", null, 3],
  ["og_image_url", "Open Graph Image URL"],
  ["seo_content", "SEO Content", null, 5],
];

/* =========================================================
   SEO PERMISSION
========================================================= */

const canManagePageSeo = () => {
  try {
    const user = JSON.parse(
      sessionStorage.getItem("user") || "{}"
    );

    const roleId = Number(user?.role_id);

    return [1, 6].includes(roleId);
  } catch {
    return false;
  }
};

/* =========================================================
   PAGE SEO SETTINGS
========================================================= */

const PageSEOSettings = ({ pageId }) => {
  const [seo, setSeo] = useState(null);
  const [loadingSeo, setLoadingSeo] = useState(true);
  const [savingSeo, setSavingSeo] = useState(false);
  const [uploadingSeo, setUploadingSeo] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [retry, setRetry] = useState(0);

  /* =======================================================
     FETCH SEO
  ======================================================= */

  useEffect(() => {
    let active = true;

    const fetchSeo = async () => {
      setLoadingSeo(true);
      setSeo(null);
      setError("");
      setSuccess("");

      try {
        const response = await getPageSeoById(pageId);

        const record = response.data.page_seo || {};

        if (!active) {
          return;
        }

        setSeo({
          ...Object.fromEntries(
            SEO_FIELDS.map(([key]) => [
              key,
              record[key] ?? "",
            ])
          ),

          robots_index:
            record.robots_index || "index",

          robots_follow:
            record.robots_follow || "follow",

          schema_markup:
            typeof record.schema_markup === "string"
              ? record.schema_markup
              : JSON.stringify(
                  record.schema_markup ?? {},
                  null,
                  2
                ),
        });
      } catch (err) {
        if (active) {
          setError(
            err.message || "Failed to load SEO settings."
          );
        }
      } finally {
        if (active) {
          setLoadingSeo(false);
        }
      }
    };

    fetchSeo();

    return () => {
      active = false;
    };
  }, [pageId, retry]);

  /* =======================================================
     CHANGE SEO FIELD
  ======================================================= */

  const changeSeo = (field, value) => {
    setSeo((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =======================================================
     SAVE SEO
  ======================================================= */

  const saveSeo = async () => {
    setError("");
    setSuccess("");

    try {
      let schema;

      try {
        schema = JSON.parse(
          seo.schema_markup.trim() || "{}"
        );
      } catch {
        throw new Error(
          "Schema markup must contain valid JSON."
        );
      }

      if (
        schema === null ||
        typeof schema !== "object"
      ) {
        throw new Error(
          "Schema markup must be a JSON object or array."
        );
      }

      /* VALIDATE URL FIELDS */

      ["canonical_url", "og_image_url"].forEach((key) => {
        if (!seo[key].trim()) {
          return;
        }

        let url;

        try {
          url = new URL(seo[key].trim());
        } catch {
          throw new Error(
            `${key} must be a valid absolute URL.`
          );
        }

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error(
            `${key} must use HTTP or HTTPS.`
          );
        }
      });

      setSavingSeo(true);

      await updatePageSeo(pageId, {
        ...seo,
        schema_markup: schema,
      });

      setSuccess(
        "SEO settings updated successfully."
      );
    } catch (err) {
      setError(
        err.message || "Failed to save SEO settings."
      );
    } finally {
      setSavingSeo(false);
    }
  };

  /* =======================================================
     UPLOAD OPEN GRAPH IMAGE
  ======================================================= */

  const uploadOgImage = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setUploadingSeo(true);
      setError("");
      setSuccess("");

      const response = await uploadPageImage(file);

      const imageUrl =
        response?.data?.secure_url ||
        response?.data?.url ||
        response?.secure_url ||
        response?.url;

      if (!imageUrl) {
        throw new Error(
          "Image upload failed. URL was not received."
        );
      }

      changeSeo("og_image_url", imageUrl);
    } catch (err) {
      setError(
        err.message || "Failed to upload Open Graph image."
      );
    } finally {
      setUploadingSeo(false);
    }
  };

  const busy = savingSeo || uploadingSeo;

  /* =======================================================
     SEO UI
  ======================================================= */

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography
          variant="h6"
          fontWeight={600}
          mb={1}
        >
          SEO Settings
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={3}
        >
          Manage search engine metadata, canonical URL,
          social sharing, robots directives and structured
          data for this page.
        </Typography>

        <Divider sx={{ mb: 3 }} />

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

        {loadingSeo && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 4,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}

        {!loadingSeo && !seo && (
          <Button
            variant="outlined"
            onClick={() =>
              setRetry((prev) => prev + 1)
            }
          >
            Retry loading SEO
          </Button>
        )}

        {!loadingSeo && seo && (
          <>
            {/* =============================================
                META AND OPEN GRAPH FIELDS
            ============================================= */}

            <Grid container spacing={3}>
              {SEO_FIELDS.map(
                ([key, label, recommendedLength, rows]) => (
                  <Grid
                    item
                    xs={12}
                    key={key}
                  >
                    <TextField
                      fullWidth
                      label={label}
                      value={seo[key]}
                      disabled={busy}
                      multiline={Boolean(rows)}
                      minRows={rows}
                      onChange={(event) =>
                        changeSeo(
                          key,
                          event.target.value
                        )
                      }
                      helperText={
                        recommendedLength
                          ? `${seo[key].length} characters / ${recommendedLength} recommended`
                          : undefined
                      }
                    />

                    {key === "og_image_url" && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          disabled={busy}
                        >
                          {uploadingSeo
                            ? "Uploading..."
                            : "Upload OG Image"}

                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={uploadOgImage}
                          />
                        </Button>

                        {seo.og_image_url && (
                          <Box
                            component="img"
                            src={seo.og_image_url}
                            alt="Open Graph preview"
                            sx={{
                              display: "block",
                              width: "100%",
                              maxWidth: 400,
                              maxHeight: 220,
                              objectFit: "contain",
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              mt: 2,
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Grid>
                )
              )}

              {/* ===========================================
                  ROBOTS INDEX
              =========================================== */}

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
                  helperText="Control whether search engines can index this page."
                >
                  <MenuItem value="index">
                    Index
                  </MenuItem>

                  <MenuItem value="noindex">
                    No Index
                  </MenuItem>
                </TextField>
              </Grid>

              {/* ===========================================
                  ROBOTS FOLLOW
              =========================================== */}

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
                  helperText="Control whether search engines can follow links."
                >
                  <MenuItem value="follow">
                    Follow
                  </MenuItem>

                  <MenuItem value="nofollow">
                    No Follow
                  </MenuItem>
                </TextField>
              </Grid>

              {/* ===========================================
                  SCHEMA MARKUP
              =========================================== */}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={10}
                  label="Schema Markup (JSON-LD)"
                  value={seo.schema_markup}
                  disabled={busy}
                  onChange={(event) =>
                    changeSeo(
                      "schema_markup",
                      event.target.value
                    )
                  }
                  helperText="Enter valid JSON-LD structured data."
                  InputProps={{
                    sx: {
                      fontFamily: "monospace",
                      fontSize: 13,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* =============================================
                SAVE SEO BUTTON
            ============================================= */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                onClick={saveSeo}
                disabled={busy}
                sx={{
                  background: "#c91f26",
                  px: 4,
                  py: 1.3,
                  "&:hover": {
                    background: "#aa1a20",
                  },
                }}
              >
                {savingSeo
                  ? "Saving SEO..."
                  : "Save SEO Settings"}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

PageSEOSettings.propTypes = {
  pageId: PropTypes.number.isRequired,
};

/* =========================================================
   OUR PROCESS CMS
========================================================= */

const OurProcess = () => {
  const [pageId, setPageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState("");

  const [form, setForm] = useState({
    pageHeader: {
      heading: "",
    },

    processSteps: [],
  });

  /* =======================================================
     FETCH PAGE
  ======================================================= */

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await getPageBySlug("our-process");

      const page = response.data || response;

      if (!page?.id) {
        throw new Error("Our Process page not found.");
      }

      setPageId(page.id);

      setForm({
        pageHeader: {
          heading:
            page.content?.pageHeader?.heading || "",
        },

        processSteps:
          page.content?.processSteps || [],
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     HEADER CHANGE
  ======================================================= */

  const handleHeaderChange = (value) => {
    setForm((prev) => ({
      ...prev,

      pageHeader: {
        heading: value,
      },
    }));
  };

  /* =======================================================
     PROCESS STEP CHANGE
  ======================================================= */

  const handleStepChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.processSteps];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        processSteps: updated,
      };
    });
  };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageUpload = async (event, index) => {
    try {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      setUploadingField(`step-${index}`);

      const response = await uploadPageImage(file);

      const imageUrl =
        response?.data?.secure_url ||
        response?.data?.url ||
        response?.secure_url ||
        response?.url;

      if (!imageUrl) {
        throw new Error("Image upload failed.");
      }

      handleStepChange(index, "image", imageUrl);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setUploadingField("");
      event.target.value = "";
    }
  };

  /* =======================================================
     SAVE PAGE CONTENT
  ======================================================= */

  const handleSave = async () => {
    try {
      if (!pageId) {
        throw new Error(
          "Our Process page ID not found."
        );
      }

      setSaving(true);

      await updatePage(pageId, {
        title: form.pageHeader.heading,

        status: "published",

        content: form,
      });

      alert(
        "Our Process page updated successfully."
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* =======================================================
     PAGE UI
  ======================================================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* ===============================================
            PAGE TITLE
        =============================================== */}

        <Typography
          variant="h4"
          fontWeight={600}
          mb={1}
        >
          Our Process CMS
        </Typography>

        <Box
          sx={{
            width: 70,
            height: 4,
            background: "#c91f26",
            mb: 4,
          }}
        />

        {/* ===============================================
            PAGE HEADER
        =============================================== */}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" mb={3}>
              Page Header
            </Typography>

            <TextField
              fullWidth
              label="Heading"
              value={form.pageHeader.heading}
              onChange={(e) =>
                handleHeaderChange(e.target.value)
              }
            />
          </CardContent>
        </Card>

        {/* ===============================================
            PROCESS STEPS
        =============================================== */}

        {form.processSteps.map((step, index) => (
          <Card
            key={step.id || index}
            sx={{ mb: 4 }}
          >
            <CardContent>
              <Typography variant="h6" mb={3}>
                Step {step.id}
              </Typography>

              <Grid container spacing={4}>
                {/* =======================================
                    STEP IMAGE
                ======================================= */}

                <Grid item xs={12} md={5}>
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={
                      uploadingField === `step-${index}`
                    }
                    sx={{ mb: 2 }}
                  >
                    {uploadingField === `step-${index}`
                      ? "Uploading..."
                      : "Upload Image"}

                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, index)
                      }
                    />
                  </Button>

                  <TextField
                    fullWidth
                    label="Image URL"
                    value={step.image || ""}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Image Alt"
                    value={step.imageAlt || ""}
                    onChange={(e) =>
                      handleStepChange(
                        index,
                        "imageAlt",
                        e.target.value
                      )
                    }
                    sx={{ mb: 2 }}
                  />

                  {step.image && (
                    <Box
                      component="img"
                      src={step.image}
                      alt={step.imageAlt || step.title || ""}
                      sx={{
                        width: "100%",
                        height: 300,
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Grid>

                {/* =======================================
                    STEP CONTENT
                ======================================= */}

                <Grid item xs={12} md={7}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={step.title || ""}
                    onChange={(e) =>
                      handleStepChange(
                        index,
                        "title",
                        e.target.value
                      )
                    }
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Button Text"
                    value={step.buttonText || ""}
                    onChange={(e) =>
                      handleStepChange(
                        index,
                        "buttonText",
                        e.target.value
                      )
                    }
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Button Link"
                    value={step.buttonLink || ""}
                    onChange={(e) =>
                      handleStepChange(
                        index,
                        "buttonLink",
                        e.target.value
                      )
                    }
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    minRows={5}
                    label="Description"
                    value={step.description || ""}
                    onChange={(e) =>
                      handleStepChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        {/* ===============================================
            SEO SETTINGS - ROLE 1 AND ROLE 6 ONLY
        =============================================== */}

        {Boolean(pageId) && canManagePageSeo() && (
          <PageSEOSettings
            key={pageId}
            pageId={pageId}
          />
        )}

        {/* ===============================================
            SAVE PAGE CONTENT
        =============================================== */}

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            saving ||
            Boolean(uploadingField) ||
            !pageId
          }
          sx={{
            background: "#c91f26",
            px: 5,
            py: 1.4,

            "&:hover": {
              background: "#aa1a20",
            },
          }}
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </Button>
      </Container>
    </Box>
  );
};

export default OurProcess;