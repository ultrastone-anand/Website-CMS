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

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await getPageBySlug("our-process");
      const page = response.data || response;

      setPageId(page.id);

      setForm({
        pageHeader: {
          heading: page.content?.pageHeader?.heading || "",
        },
        processSteps: page.content?.processSteps || [],
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderChange = (value) => {
    setForm((prev) => ({
      ...prev,
      pageHeader: {
        heading: value,
      },
    }));
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...form.processSteps];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setForm((prev) => ({
      ...prev,
      processSteps: updated,
    }));
  };

  const handleImageUpload = async (event, index) => {
    try {
      const file = event.target.files?.[0];

      if (!file) return;

      setUploadingField(`step-${index}`);

      const response = await uploadPageImage(file);

      const imageUrl =
        response.data?.secure_url ||
        response.secure_url;

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

  const handleSave = async () => {
    try {
      setSaving(true);

      await updatePage(pageId, {
        title: form.pageHeader.heading,
        status: "published",
        content: form,
      });

      alert("Our Process page updated successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight={600} mb={1}>
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

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" mb={3}>
              Page Header
            </Typography>

            <TextField
              fullWidth
              label="Heading"
              value={form.pageHeader.heading}
              onChange={(e) => handleHeaderChange(e.target.value)}
            />
          </CardContent>
        </Card>

        {form.processSteps.map((step, index) => (
          <Card key={step.id || index} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" mb={3}>
                Step {step.id}
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={uploadingField === `step-${index}`}
                    sx={{ mb: 2 }}
                  >
                    {uploadingField === `step-${index}`
                      ? "Uploading..."
                      : "Upload Image"}

                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                    />
                  </Button>

                  <TextField
                    fullWidth
                    label="Image URL"
                    value={step.image}
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Image Alt"
                    value={step.imageAlt}
                    onChange={(e) =>
                      handleStepChange(index, "imageAlt", e.target.value)
                    }
                    sx={{ mb: 2 }}
                  />

                  {step.image && (
                    <Box
                      component="img"
                      src={step.image}
                      alt={step.imageAlt}
                      sx={{
                        width: "100%",
                        height: 300,
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Grid>

                <Grid item xs={12} md={7}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={step.title}
                    onChange={(e) =>
                      handleStepChange(index, "title", e.target.value)
                    }
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Button Text"
                    value={step.buttonText}
                    onChange={(e) =>
                      handleStepChange(index, "buttonText", e.target.value)
                    }
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Button Link"
                    value={step.buttonLink}
                    onChange={(e) =>
                      handleStepChange(index, "buttonLink", e.target.value)
                    }
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    minRows={5}
                    label="Description"
                    value={step.description}
                    onChange={(e) =>
                      handleStepChange(index, "description", e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

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

export default OurProcess;