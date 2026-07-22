import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  Box,
  Card,
  Grid,
  Alert,
  Button,
  Divider,
  Container,
  TextField,
  Typography,
  CardContent,
  CircularProgress,
} from "@mui/material";

import {
  updatePage,
  getPageBySlug,
  uploadPagePdf,
  uploadPageImage,
} from "../../../services/pages.service";

const PAGE_SLUG = "merchandising-displays";

const createDisplayItem = () => ({
  id: `${Date.now()}-${Math.random()}`,
  name: "",
  size: "",
  image: "",
  imageAlt: "",
  pdfUrl: "",
  pdfName: "",
  buttonText: "Download PDF",
});

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const getImageUploadLabel = ({
  isUploading,
  hasImage,
  uploadLabel,
  replaceLabel,
}) => {
  if (isUploading) {
    return "Uploading...";
  }

  if (hasImage) {
    return replaceLabel;
  }

  return uploadLabel;
};

const getPdfUploadLabel = ({
  isUploading,
  hasPdf,
}) => {
  if (isUploading) {
    return "Uploading PDF...";
  }

  if (hasPdf) {
    return "Replace PDF";
  }

  return "Upload PDF";
};

const MerchandisingDisplays = () => {
  const [pageId, setPageId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [form, setForm] = useState({
    pageHeader: {
      heading: "",
    },

    hero: {
      image: "",
      imageAlt: "",
      title: "",
    },

    quoteSection: {
      description: "",
      backgroundImage: "",
    },

    displaySection: {
      heading: "",
      items: [],
    },

    cta: {
      image: "",
      imageAlt: "",
      title: "",
      buttonLink: "",
      buttonText: "",
    },
  });

  const resultText = useMemo(() => {
    const count =
      form.displaySection.items.length;

    if (count === 1) {
      return "Showing all 1 result";
    }

    return `Showing all ${count} results`;
  }, [form.displaySection.items.length]);

  const fetchPage = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response =
        await getPageBySlug(PAGE_SLUG);

      const page = response?.data || response;

      if (!page?.id) {
        throw new Error(
          "Merchandising Displays page was not found."
        );
      }

      const content = page.content || {};

      setPageId(page.id);

      setForm({
        pageHeader: {
          heading:
            content.pageHeader?.heading ||
            "Merchandising Displays",
        },

        hero: {
          image: content.hero?.image || "",
          imageAlt:
            content.hero?.imageAlt || "",
          title:
            content.hero?.title ||
            "Merchandising Displays",
        },

        quoteSection: {
          description:
            content.quoteSection?.description ||
            "",

          backgroundImage:
            content.quoteSection
              ?.backgroundImage || "",
        },

        displaySection: {
          heading:
            content.displaySection?.heading ||
            "Our Displays",

          items: Array.isArray(
            content.displaySection?.items
          )
            ? content.displaySection.items.map(
                (item, index) => ({
                  id:
                    item.id ||
                    `${Date.now()}-${index}`,

                  name: item.name || "",
                  size: item.size || "",
                  image: item.image || "",
                  imageAlt:
                    item.imageAlt || "",
                  pdfUrl: item.pdfUrl || "",
                  pdfName:
                    item.pdfName || "",
                  buttonText:
                    item.buttonText ||
                    "Download PDF",
                })
              )
            : [],
        },

        cta: {
          image: content.cta?.image || "",
          imageAlt:
            content.cta?.imageAlt || "",
          title:
            content.cta?.title ||
            "Request Your Display",
          buttonLink:
            content.cta?.buttonLink || "#",
          buttonText:
            content.cta?.buttonText ||
            "Click Here",
        },
      });
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getErrorMessage(
          error,
          "Failed to load Merchandising Displays page."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleChange = (
    section,
    field,
    value
  ) => {
    setForm((previousForm) => ({
      ...previousForm,

      [section]: {
        ...previousForm[section],
        [field]: value,
      },
    }));
  };

  const handleDisplayItemChange = (
    index,
    field,
    value
  ) => {
    setForm((previousForm) => {
      const updatedItems = [
        ...previousForm.displaySection.items,
      ];

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      return {
        ...previousForm,

        displaySection: {
          ...previousForm.displaySection,
          items: updatedItems,
        },
      };
    });
  };

  const handleAddDisplay = () => {
    setForm((previousForm) => ({
      ...previousForm,

      displaySection: {
        ...previousForm.displaySection,

        items: [
          ...previousForm.displaySection.items,
          createDisplayItem(),
        ],
      },
    }));
  };

  const handleRemoveDisplay = (index) => {
    const displayName =
      form.displaySection.items[index]?.name ||
      `Display Item ${index + 1}`;

    const shouldRemove = window.confirm(
      `Are you sure you want to remove "${displayName}"?`
    );

    if (!shouldRemove) {
      return;
    }

    setForm((previousForm) => ({
      ...previousForm,

      displaySection: {
        ...previousForm.displaySection,

        items:
          previousForm.displaySection.items.filter(
            (_, itemIndex) =>
              itemIndex !== index
          ),
      },
    }));
  };

  const handleImageUpload = async (
    event,
    section,
    field
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const uploadKey = `${section}.${field}`;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setUploadingField(uploadKey);

      const response =
        await uploadPageImage(file);

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

      handleChange(
        section,
        field,
        imageUrl
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getErrorMessage(
          error,
          "Image upload failed."
        )
      );
    } finally {
      setUploadingField("");
      event.target.value = "";
    }
  };

  const handleDisplayImageUpload = async (
    event,
    index
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const uploadKey =
      `displaySection.items.${index}.image`;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setUploadingField(uploadKey);

      const response =
        await uploadPageImage(file);

      const imageUrl =
        response?.data?.secure_url ||
        response?.data?.url ||
        response?.secure_url ||
        response?.url;

      if (!imageUrl) {
        throw new Error(
          "Display image upload failed. URL was not received."
        );
      }

      handleDisplayItemChange(
        index,
        "image",
        imageUrl
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getErrorMessage(
          error,
          "Display image upload failed."
        )
      );
    } finally {
      setUploadingField("");
      event.target.value = "";
    }
  };

  const handlePdfUpload = async (
    event,
    index
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdf) {
      setErrorMessage(
        "Please select a valid PDF file."
      );

      event.target.value = "";
      return;
    }

    const uploadKey =
      `displaySection.items.${index}.pdf`;

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setUploadingField(uploadKey);

      const response =
        await uploadPagePdf(file);

      const pdfData =
        response?.data || response;

      const pdfUrl =
        pdfData?.pdfUrl ||
        pdfData?.url ||
        pdfData?.relativeUrl;

      if (!pdfUrl) {
        throw new Error(
          "PDF upload failed. URL was not received."
        );
      }

      setForm((previousForm) => {
        const updatedItems = [
          ...previousForm.displaySection.items,
        ];

        updatedItems[index] = {
          ...updatedItems[index],
          pdfUrl,
          pdfName:
            pdfData?.fileName ||
            pdfData?.originalName ||
            file.name,
        };

        return {
          ...previousForm,

          displaySection: {
            ...previousForm.displaySection,
            items: updatedItems,
          },
        };
      });
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getErrorMessage(
          error,
          "PDF upload failed."
        )
      );
    } finally {
      setUploadingField("");
      event.target.value = "";
    }
  };

  const handleRemovePdf = (index) => {
    const shouldRemove = window.confirm(
      "Remove this PDF from the display item?"
    );

    if (!shouldRemove) {
      return;
    }

    setForm((previousForm) => {
      const updatedItems = [
        ...previousForm.displaySection.items,
      ];

      updatedItems[index] = {
        ...updatedItems[index],
        pdfUrl: "",
        pdfName: "",
      };

      return {
        ...previousForm,

        displaySection: {
          ...previousForm.displaySection,
          items: updatedItems,
        },
      };
    });
  };

  const validateForm = () => {
    if (!form.pageHeader.heading.trim()) {
      return "Page heading is required.";
    }

    if (!form.hero.title.trim()) {
      return "Hero title is required.";
    }

    if (
      !form.displaySection.heading.trim()
    ) {
      return "Display section heading is required.";
    }

    for (
      let index = 0;
      index <
      form.displaySection.items.length;
      index += 1
    ) {
      const item =
        form.displaySection.items[index];

      if (!item.name.trim()) {
        return `Display Item ${
          index + 1
        }: display name is required.`;
      }
    }

    return "";
  };

  const handleSave = async () => {
    const validationError =
      validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!pageId) {
      setErrorMessage(
        "Page ID is missing. Please refresh the page."
      );
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const content = {
        pageHeader: {
          heading:
            form.pageHeader.heading.trim(),
        },

        hero: {
          image: form.hero.image,
          imageAlt:
            form.hero.imageAlt.trim(),
          title: form.hero.title.trim(),
        },

        quoteSection: {
          description:
            form.quoteSection.description.trim(),

          backgroundImage:
            form.quoteSection.backgroundImage,
        },

        displaySection: {
          heading:
            form.displaySection.heading.trim(),

          items:
            form.displaySection.items.map(
              (item, index) => ({
                id: index + 1,
                name: item.name.trim(),
                size: item.size.trim(),
                image: item.image,
                imageAlt:
                  item.imageAlt.trim(),
                pdfUrl: item.pdfUrl,
                pdfName: item.pdfName,
                buttonText:
                  item.buttonText.trim() ||
                  "Download PDF",
              })
            ),
        },

        cta: {
          image: form.cta.image,
          imageAlt:
            form.cta.imageAlt.trim(),
          title: form.cta.title.trim(),
          buttonLink:
            form.cta.buttonLink.trim(),
          buttonText:
            form.cta.buttonText.trim(),
        },
      };

      await updatePage(pageId, {
        slug: PAGE_SLUG,
        title:
          form.pageHeader.heading.trim(),
        status: "published",
        content,
      });

      setSuccessMessage(
        "Merchandising Displays page updated successfully."
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getErrorMessage(
          error,
          "Failed to update Merchandising Displays page."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const isUploading =
    Boolean(uploadingField);

  const getSaveButtonLabel = () => {
    if (saving) {
      return "Saving...";
    }

    if (isUploading) {
      return "Upload in Progress...";
    }

    return "Save Changes";
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
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          fontWeight={600}
          mb={1}
        >
          Merchandising Displays Page CMS
        </Typography>

        <Box
          sx={{
            width: 70,
            height: 4,
            background: "#c91f26",
            mb: 4,
          }}
        />

        {errorMessage && (
          <Alert
            severity="error"
            onClose={() =>
              setErrorMessage("")
            }
            sx={{ mb: 3 }}
          >
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert
            severity="success"
            onClose={() =>
              setSuccessMessage("")
            }
            sx={{ mb: 3 }}
          >
            {successMessage}
          </Alert>
        )}

        {/* PAGE HEADER */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              mb={3}
            >
              Page Header
            </Typography>

            <Grid container spacing={3}>
              <Grid
                item
                xs={12}
                md={8}
              >
                <TextField
                  fullWidth
                  label="Heading"
                  value={
                    form.pageHeader.heading
                  }
                  onChange={(event) =>
                    handleChange(
                      "pageHeader",
                      "heading",
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
                  label="Result Text"
                  value={resultText}
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="Automatically calculated from display items."
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* HERO SECTION */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              mb={3}
            >
              Hero Section
            </Typography>

            <Grid container spacing={4}>
              <Grid
                item
                xs={12}
                md={6}
              >
                <Button
                  variant="outlined"
                  component="label"
                  disabled={
                    uploadingField ===
                    "hero.image"
                  }
                  sx={{ mb: 2 }}
                >
                  {getImageUploadLabel({
                    isUploading:
                      uploadingField ===
                      "hero.image",

                    hasImage: Boolean(
                      form.hero.image
                    ),

                    uploadLabel:
                      "Upload Hero Image",

                    replaceLabel:
                      "Replace Hero Image",
                  })}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleImageUpload(
                        event,
                        "hero",
                        "image"
                      )
                    }
                  />
                </Button>

                <TextField
                  fullWidth
                  label="Hero Image URL"
                  value={form.hero.image}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Hero Image Alt Text"
                  value={
                    form.hero.imageAlt
                  }
                  onChange={(event) =>
                    handleChange(
                      "hero",
                      "imageAlt",
                      event.target.value
                    )
                  }
                  sx={{ mb: 2 }}
                />

                {form.hero.image && (
                  <Box
                    component="img"
                    src={form.hero.image}
                    alt={
                      form.hero.imageAlt ||
                      "Hero preview"
                    }
                    sx={{
                      width: "100%",
                      height: 350,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                )}
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Hero Title"
                  value={form.hero.title}
                  onChange={(event) =>
                    handleChange(
                      "hero",
                      "title",
                      event.target.value
                    )
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* QUOTE SECTION */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              mb={3}
            >
              Quote Section
            </Typography>

            <Grid container spacing={4}>
              <Grid
                item
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={8}
                  label="Description"
                  value={
                    form.quoteSection
                      .description
                  }
                  onChange={(event) =>
                    handleChange(
                      "quoteSection",
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
                <Button
                  variant="outlined"
                  component="label"
                  disabled={
                    uploadingField ===
                    "quoteSection.backgroundImage"
                  }
                  sx={{ mb: 2 }}
                >
                  {getImageUploadLabel({
                    isUploading:
                      uploadingField ===
                      "quoteSection.backgroundImage",

                    hasImage: Boolean(
                      form.quoteSection
                        .backgroundImage
                    ),

                    uploadLabel:
                      "Upload Background Image",

                    replaceLabel:
                      "Replace Background Image",
                  })}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleImageUpload(
                        event,
                        "quoteSection",
                        "backgroundImage"
                      )
                    }
                  />
                </Button>

                <TextField
                  fullWidth
                  label="Background Image URL"
                  value={
                    form.quoteSection
                      .backgroundImage
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 2 }}
                />

                {form.quoteSection
                  .backgroundImage && (
                  <Box
                    component="img"
                    src={
                      form.quoteSection
                        .backgroundImage
                    }
                    alt="Quote section background"
                    sx={{
                      width: "100%",
                      height: 280,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* DISPLAY SECTION */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                gap: 2,

                alignItems: {
                  xs: "stretch",
                  sm: "center",
                },

                justifyContent:
                  "space-between",

                flexDirection: {
                  xs: "column",
                  sm: "row",
                },

                mb: 3,
              }}
            >
              <Typography variant="h6">
                Display Section
              </Typography>

              <Button
                variant="contained"
                onClick={handleAddDisplay}
                disabled={isUploading}
                sx={{
                  background: "#c91f26",

                  "&:hover": {
                    background: "#aa1a20",
                  },
                }}
              >
                Add More Display
              </Button>
            </Box>

            <TextField
              fullWidth
              label="Section Heading"
              value={
                form.displaySection.heading
              }
              onChange={(event) =>
                handleChange(
                  "displaySection",
                  "heading",
                  event.target.value
                )
              }
              sx={{ mb: 2 }}
            />

            <Typography
              color="text.secondary"
              mb={4}
            >
              {resultText}
            </Typography>

            {form.displaySection.items
              .length === 0 && (
              <Box
                sx={{
                  py: 6,
                  px: 2,
                  textAlign: "center",
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Typography
                  color="text.secondary"
                  mb={2}
                >
                  No displays have been added.
                </Typography>

                <Button
                  variant="outlined"
                  onClick={handleAddDisplay}
                >
                  Add First Display
                </Button>
              </Box>
            )}

            {form.displaySection.items.map(
              (item, index) => {
                const imageUploadKey =
                  `displaySection.items.${index}.image`;

                const pdfUploadKey =
                  `displaySection.items.${index}.pdf`;

                return (
                  <Box key={item.id}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "space-between",
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                      >
                        Display Item{" "}
                        {index + 1}
                      </Typography>

                      <Button
                        variant="outlined"
                        color="error"
                        disabled={isUploading}
                        onClick={() =>
                          handleRemoveDisplay(
                            index
                          )
                        }
                      >
                        Remove Display
                      </Button>
                    </Box>

                    <Grid
                      container
                      spacing={4}
                    >
                      <Grid
                        item
                        xs={12}
                        md={5}
                      >
                        <Button
                          variant="outlined"
                          component="label"
                          disabled={
                            uploadingField ===
                            imageUploadKey
                          }
                          sx={{ mb: 2 }}
                        >
                          {getImageUploadLabel({
                            isUploading:
                              uploadingField ===
                              imageUploadKey,

                            hasImage: Boolean(
                              item.image
                            ),

                            uploadLabel:
                              "Upload Display Image",

                            replaceLabel:
                              "Replace Display Image",
                          })}

                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              handleDisplayImageUpload(
                                event,
                                index
                              )
                            }
                          />
                        </Button>

                        <TextField
                          fullWidth
                          label="Image URL"
                          value={item.image}
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{ mb: 2 }}
                        />

                        <TextField
                          fullWidth
                          label="Image Alt Text"
                          value={
                            item.imageAlt
                          }
                          onChange={(event) =>
                            handleDisplayItemChange(
                              index,
                              "imageAlt",
                              event.target.value
                            )
                          }
                          sx={{ mb: 2 }}
                        />

                        {item.image && (
                          <Box
                            component="img"
                            src={item.image}
                            alt={
                              item.imageAlt ||
                              item.name ||
                              "Display preview"
                            }
                            sx={{
                              width: "100%",
                              height: 320,
                              objectFit:
                                "cover",
                              borderRadius: 1,
                            }}
                          />
                        )}
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        md={7}
                      >
                        <TextField
                          fullWidth
                          required
                          label="Display Name"
                          value={item.name}
                          onChange={(event) =>
                            handleDisplayItemChange(
                              index,
                              "name",
                              event.target.value
                            )
                          }
                          sx={{ mb: 2 }}
                        />

                        <TextField
                          fullWidth
                          label="Display Size"
                          placeholder={
                            '21"W x 70"H x 24"D'
                          }
                          value={item.size}
                          onChange={(event) =>
                            handleDisplayItemChange(
                              index,
                              "size",
                              event.target.value
                            )
                          }
                          sx={{ mb: 2 }}
                        />

                        <TextField
                          fullWidth
                          label="PDF Button Text"
                          value={
                            item.buttonText
                          }
                          onChange={(event) =>
                            handleDisplayItemChange(
                              index,
                              "buttonText",
                              event.target.value
                            )
                          }
                          sx={{ mb: 3 }}
                        />

                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          mb={1.5}
                        >
                          Display PDF
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                            alignItems:
                              "center",
                            mb: 2,
                          }}
                        >
                          <Button
                            variant="outlined"
                            component="label"
                            disabled={
                              uploadingField ===
                              pdfUploadKey
                            }
                          >
                            {getPdfUploadLabel({
                              isUploading:
                                uploadingField ===
                                pdfUploadKey,

                              hasPdf: Boolean(
                                item.pdfUrl
                              ),
                            })}

                            <input
                              hidden
                              type="file"
                              accept="application/pdf,.pdf"
                              onChange={(event) =>
                                handlePdfUpload(
                                  event,
                                  index
                                )
                              }
                            />
                          </Button>

                          {item.pdfUrl && (
                            <>
                              <Button
                                component="a"
                                href={
                                  item.pdfUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View PDF
                              </Button>

                              <Button
                                color="error"
                                onClick={() =>
                                  handleRemovePdf(
                                    index
                                  )
                                }
                              >
                                Remove PDF
                              </Button>
                            </>
                          )}
                        </Box>

                        <TextField
                          fullWidth
                          label="Uploaded PDF"
                          value={
                            item.pdfName ||
                            item.pdfUrl
                          }
                          InputProps={{
                            readOnly: true,
                          }}
                          helperText={
                            item.pdfUrl
                              ? "PDF uploaded successfully."
                              : "Upload the display PDF."
                          }
                        />
                      </Grid>
                    </Grid>

                    {index <
                      form.displaySection.items
                        .length -
                        1 && (
                      <Divider sx={{ my: 5 }} />
                    )}
                  </Box>
                );
              }
            )}

            {form.displaySection.items
              .length > 0 && (
              <Box
                sx={{
                  mt: 5,
                  display: "flex",
                  justifyContent:
                    "center",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleAddDisplay}
                  disabled={isUploading}
                  sx={{ px: 4 }}
                >
                  Add More Display
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* CTA SECTION */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              mb={3}
            >
              Call to Action Section
            </Typography>

            <Grid container spacing={4}>
              <Grid
                item
                xs={12}
                md={6}
              >
                <Button
                  variant="outlined"
                  component="label"
                  disabled={
                    uploadingField ===
                    "cta.image"
                  }
                  sx={{ mb: 2 }}
                >
                  {getImageUploadLabel({
                    isUploading:
                      uploadingField ===
                      "cta.image",

                    hasImage: Boolean(
                      form.cta.image
                    ),

                    uploadLabel:
                      "Upload CTA Image",

                    replaceLabel:
                      "Replace CTA Image",
                  })}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleImageUpload(
                        event,
                        "cta",
                        "image"
                      )
                    }
                  />
                </Button>

                <TextField
                  fullWidth
                  label="CTA Image URL"
                  value={form.cta.image}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="CTA Image Alt Text"
                  value={
                    form.cta.imageAlt
                  }
                  onChange={(event) =>
                    handleChange(
                      "cta",
                      "imageAlt",
                      event.target.value
                    )
                  }
                  sx={{ mb: 2 }}
                />

                {form.cta.image && (
                  <Box
                    component="img"
                    src={form.cta.image}
                    alt={
                      form.cta.imageAlt ||
                      "CTA preview"
                    }
                    sx={{
                      width: "100%",
                      height: 300,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                )}
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <TextField
                  fullWidth
                  label="CTA Title"
                  value={form.cta.title}
                  onChange={(event) =>
                    handleChange(
                      "cta",
                      "title",
                      event.target.value
                    )
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Button Text"
                  value={
                    form.cta.buttonText
                  }
                  onChange={(event) =>
                    handleChange(
                      "cta",
                      "buttonText",
                      event.target.value
                    )
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Button Link"
                  value={
                    form.cta.buttonLink
                  }
                  onChange={(event) =>
                    handleChange(
                      "cta",
                      "buttonLink",
                      event.target.value
                    )
                  }
                  placeholder="/contact-us"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            saving ||
            isUploading ||
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
          {getSaveButtonLabel()}
        </Button>
      </Container>
    </Box>
  );
};

export default MerchandisingDisplays;