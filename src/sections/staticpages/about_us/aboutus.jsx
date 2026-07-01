import React, { useState, useEffect } from "react";

import {
  Box,
  Card,
  Grid,
  Button,
  Container,
  TextField,
  Typography,
  CardContent,
  CircularProgress,
} from "@mui/material";

import {
  updatePage,
  getPageBySlug,
  uploadPageImage,
} from "../../../services/pages.service";

const Aboutus = () => {
  const [pageId, setPageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState("");

  const [form, setForm] = useState({
    pageHeader: {
      heading: "",
    },
    aboutSection: {
      image: "",
      imageAlt: "",
      title: "",
      paragraphs: ["", "", "", ""],
    },
    bottomBanner: {
      image: "",
      imageAlt: "",
    },
  });

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await getPageBySlug("about-us");
      const page = response.data || response;

      setPageId(page.id);

      setForm({
        pageHeader: {
          heading: page.content?.pageHeader?.heading || "",
        },
        aboutSection: {
          image: page.content?.aboutSection?.image || "",
          imageAlt: page.content?.aboutSection?.imageAlt || "",
          title: page.content?.aboutSection?.title || "",
          paragraphs:
            page.content?.aboutSection?.paragraphs || ["", "", "", ""],
        },
        bottomBanner: {
          image: page.content?.bottomBanner?.image || "",
          imageAlt: page.content?.bottomBanner?.imageAlt || "",
        },
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleParagraphChange = (index, value) => {
    const updatedParagraphs = [...form.aboutSection.paragraphs];
    updatedParagraphs[index] = value;

    setForm((prev) => ({
      ...prev,
      aboutSection: {
        ...prev.aboutSection,
        paragraphs: updatedParagraphs,
      },
    }));
  };

  const handleImageUpload = async (event, section, field) => {
    try {
      const file = event.target.files?.[0];

      if (!file) return;

      setUploadingField(`${section}.${field}`);

      const response = await uploadPageImage(file);
const imageUrl =
  response.data?.secure_url ||
  response.secure_url;

      if (!imageUrl) {
        throw new Error("Image upload failed. URL not received.");
      }

      handleChange(section, field, imageUrl);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setUploadingField("");
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await updatePage(pageId, {
        title: form.pageHeader.heading,
        status: "published",
        content: form,
      });

      alert("About Us page updated successfully");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{  minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight={600} mb={1}>
          About Us Page CMS
        </Typography>

        <Box
          sx={{
            width: 70,
            height: 4,
            background: "#c91f26",
            mb: 4,
          }}
        />

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
                handleChange("pageHeader", "heading", e.target.value)
              }
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" mb={3}>
              About Section
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploadingField === "aboutSection.image"}
                  sx={{ mb: 2 }}
                >
                  {uploadingField === "aboutSection.image"
                    ? "Uploading..."
                    : "Upload About Image"}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e, "aboutSection", "image")
                    }
                  />
                </Button>

                <TextField
                  fullWidth
                  label="Image URL"
                  value={form.aboutSection.image}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Image Alt Text"
                  value={form.aboutSection.imageAlt}
                  onChange={(e) =>
                    handleChange("aboutSection", "imageAlt", e.target.value)
                  }
                  sx={{ mb: 2 }}
                />

                {form.aboutSection.image && (
                  <Box
                    component="img"
                    src={form.aboutSection.image}
                    alt={form.aboutSection.imageAlt}
                    sx={{
                      width: "100%",
                      height: 420,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Main Title"
                  value={form.aboutSection.title}
                  onChange={(e) =>
                    handleChange("aboutSection", "title", e.target.value)
                  }
                  sx={{ mb: 3 }}
                />

                {form.aboutSection.paragraphs.map((paragraph, index) => (
                  <TextField
                    key={index}
                    fullWidth
                    multiline
                    minRows={3}
                    label={`Paragraph ${index + 1}`}
                    value={paragraph}
                    onChange={(e) =>
                      handleParagraphChange(index, e.target.value)
                    }
                    sx={{ mb: 2 }}
                  />
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" mb={3}>
              Bottom Banner
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploadingField === "bottomBanner.image"}
                  sx={{ mb: 2 }}
                >
                  {uploadingField === "bottomBanner.image"
                    ? "Uploading..."
                    : "Upload Banner Image"}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e, "bottomBanner", "image")
                    }
                  />
                </Button>

                <TextField
                  fullWidth
                  label="Banner Image URL"
                  value={form.bottomBanner.image}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Banner Image Alt"
                  value={form.bottomBanner.imageAlt}
                  onChange={(e) =>
                    handleChange("bottomBanner", "imageAlt", e.target.value)
                  }
                  sx={{ mb: 2 }}
                />

                {form.bottomBanner.image && (
                  <Box
                    component="img"
                    src={form.bottomBanner.image}
                    alt={form.bottomBanner.imageAlt}
                    sx={{
                      width: "100%",
                      height: 260,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || uploadingField}
          sx={{
            background: "#c91f26",
            px: 5,
            py: 1.4,
            "&:hover": {
              background: "#aa1a20",
            },
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Container>
    </Box>
  );
};

export default Aboutus;