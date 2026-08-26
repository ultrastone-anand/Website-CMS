import React, {
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

/* =========================================================
   CONSTANTS
========================================================= */

const PAGE_SLUG =
  "merchandising-displays";

/* =========================================================
   CREATE DISPLAY ITEM
========================================================= */

const createDisplayItem = () => ({
  id: `${Date.now()}-${Math.random()}`,

  name: "",
  description: "",
  size: "",

  image: "",
  imageAlt: "",

  detailLink: "",

  pdfUrl: "",
  pdfName: "",

  buttonText:
    "Download Spec Sheet",
});

/* =========================================================
   HELPERS
========================================================= */

const getErrorMessage = (
  error,
  fallback,
) =>
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

/* =========================================================
   MERCHANDISING DISPLAYS CMS
========================================================= */

const MerchandisingDisplays =
  () => {
    /* =====================================================
       STATE
    ===================================================== */

    const [
      pageId,
      setPageId,
    ] = useState(null);

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      saving,
      setSaving,
    ] = useState(false);

    const [
      uploadingField,
      setUploadingField,
    ] = useState("");

    const [
      errorMessage,
      setErrorMessage,
    ] = useState("");

    const [
      successMessage,
      setSuccessMessage,
    ] = useState("");

    /* =====================================================
       FORM
    ===================================================== */

    const [
      form,
      setForm,
    ] = useState({
      hero: {
        image: "",
        imageAlt: "",

        eyebrow:
          "Merchandising Display",

        headingLine1:
          "Designed to display,",

        headingLine2:
          "built to inspire",

        description:
          "Purpose-built merchandising solutions that bring our surface collections into your showroom.",

        buttonText:
          "Request a Display",
      },

      displaySection: {
        eyebrow:
          "The Display Program",

        heading:
          "Bring the Ultra Stones experience to your showroom.",

        description:
          "Our merchandising displays are designed to present stone samples clearly, beautifully, and efficiently—helping customers explore colors, patterns, and collections with confidence.",

        image: "",
        imageAlt: "",

        items: [],
      },

      cta: {
        image: "",
        imageAlt: "",

        eyebrow:
          "Designed For The Showroom",

        titleLine1:
          "More surface.",

        titleLine2:
          "Less footprint.",

        description:
          "Our displays are engineered to maximize sample capacity while maintaining a clean, modern look that elevates your showroom space.",

        buttonText:
          "Request a Display",

        buttonLink:
          "/contact",
      },
    });

    /* =====================================================
       FETCH PAGE
    ===================================================== */

    const fetchPage =
      useCallback(
        async () => {
          try {
            setLoading(true);

            setErrorMessage("");

            const response =
              await getPageBySlug(
                PAGE_SLUG,
              );

            const page =
              response?.data ||
              response;

            if (!page?.id) {
              throw new Error(
                "Merchandising Displays page was not found.",
              );
            }

            const content =
              page.content || {};

            const hero =
              content.hero || {};

            const oldQuoteSection =
              content.quoteSection ||
              {};

            const displaySection =
              content.displaySection ||
              {};

            const cta =
              content.cta || {};

            const existingItems =
              Array.isArray(
                displaySection.items,
              )
                ? displaySection.items
                : [];

            const towerItem =
              existingItems.find(
                (item) =>
                  item.name
                    ?.toLowerCase()
                    .includes(
                      "ultra quartz tower",
                    ),
              );

            setPageId(
              page.id,
            );

            setForm({
              /* ===========================================
                 HERO
              =========================================== */

              hero: {
                image:
                  hero.image ||
                  "",

                imageAlt:
                  hero.imageAlt ||
                  "Merchandising Displays",

                eyebrow:
                  hero.eyebrow ||
                  "Merchandising Display",

                headingLine1:
                  hero.headingLine1 ||
                  "Designed to display,",

                headingLine2:
                  hero.headingLine2 ||
                  "built to inspire",

                description:
                  hero.description ||
                  "Purpose-built merchandising solutions that bring our surface collections into your showroom.",

                buttonText:
                  hero.buttonText ||
                  "Request a Display",
              },

              /* ===========================================
                 DISPLAY PROGRAM
              =========================================== */

              displaySection: {
                eyebrow:
                  displaySection.eyebrow ||
                  "The Display Program",

                heading:
                  displaySection.heading &&
                  displaySection.heading !==
                    "Our Displays"
                    ? displaySection.heading
                    : "Bring the Ultra Stones experience to your showroom.",

                description:
                  displaySection.description ||
                  oldQuoteSection.description ||
                  "Our merchandising displays are designed to present stone samples clearly, beautifully, and efficiently—helping customers explore colors, patterns, and collections with confidence.",

                image:
                  displaySection.image ||
                  towerItem?.image ||
                  existingItems[0]
                    ?.image ||
                  "",

                imageAlt:
                  displaySection.imageAlt ||
                  towerItem?.imageAlt ||
                  "Ultra Stones merchandising display",

                items:
                  existingItems.map(
                    (
                      item,
                      index,
                    ) => ({
                      id:
                        item.id ||
                        `${Date.now()}-${index}`,

                      name:
                        item.name ||
                        "",

                      description:
                        item.description ||
                        "",

                      size:
                        item.size ||
                        "",

                      image:
                        item.image ||
                        "",

                      imageAlt:
                        item.imageAlt ||
                        "",

                      detailLink:
                        item.detailLink ||
                        "",

                      pdfUrl:
                        item.pdfUrl ||
                        "",

                      pdfName:
                        item.pdfName ||
                        "",

                      buttonText:
                        item.buttonText ||
                        "Download Spec Sheet",
                    }),
                  ),
              },

              /* ===========================================
                 CTA
              =========================================== */

              cta: {
                image:
                  cta.image ||
                  towerItem?.image ||
                  "",

                imageAlt:
                  cta.imageAlt ||
                  towerItem?.imageAlt ||
                  "Ultra Quartz Tower",

                eyebrow:
                  cta.eyebrow ||
                  "Designed For The Showroom",

                titleLine1:
                  cta.titleLine1 ||
                  "More surface.",

                titleLine2:
                  cta.titleLine2 ||
                  "Less footprint.",

                description:
                  cta.description ||
                  "Our displays are engineered to maximize sample capacity while maintaining a clean, modern look that elevates your showroom space.",

                buttonText:
                  cta.buttonText &&
                  cta.buttonText !==
                    "Click Here"
                    ? cta.buttonText
                    : "Request a Display",

                buttonLink:
                  cta.buttonLink &&
                  cta.buttonLink !==
                    "#"
                    ? cta.buttonLink
                    : "/contact",
              },
            });
          } catch (error) {
            console.error(
              error,
            );

            setErrorMessage(
              getErrorMessage(
                error,
                "Failed to load Merchandising Displays page.",
              ),
            );
          } finally {
            setLoading(
              false,
            );
          }
        },
        [],
      );

    /* =====================================================
       LOAD
    ===================================================== */

    useEffect(() => {
      fetchPage();
    }, [fetchPage]);

    /* =====================================================
       SECTION CHANGE
    ===================================================== */

    const handleChange = (
      section,
      field,
      value,
    ) => {
      setForm(
        (
          previousForm,
        ) => ({
          ...previousForm,

          [section]: {
            ...previousForm[
              section
            ],

            [field]:
              value,
          },
        }),
      );
    };

    /* =====================================================
       DISPLAY ITEM CHANGE
    ===================================================== */

    const handleDisplayItemChange =
      (
        index,
        field,
        value,
      ) => {
        setForm(
          (
            previousForm,
          ) => {
            const updatedItems =
              [
                ...previousForm
                  .displaySection
                  .items,
              ];

            updatedItems[
              index
            ] = {
              ...updatedItems[
                index
              ],

              [field]:
                value,
            };

            return {
              ...previousForm,

              displaySection: {
                ...previousForm
                  .displaySection,

                items:
                  updatedItems,
              },
            };
          },
        );
      };

    /* =====================================================
       ADD DISPLAY
    ===================================================== */

    const handleAddDisplay =
      () => {
        setForm(
          (
            previousForm,
          ) => ({
            ...previousForm,

            displaySection: {
              ...previousForm
                .displaySection,

              items: [
                ...previousForm
                  .displaySection
                  .items,

                createDisplayItem(),
              ],
            },
          }),
        );
      };

    /* =====================================================
       REMOVE DISPLAY
    ===================================================== */

    const handleRemoveDisplay =
      (index) => {
        const displayName =
          form.displaySection
            .items[index]
            ?.name ||
          `Display Item ${
            index + 1
          }`;

        const shouldRemove =
          window.confirm(
            `Are you sure you want to remove "${displayName}"?`,
          );

        if (
          !shouldRemove
        ) {
          return;
        }

        setForm(
          (
            previousForm,
          ) => ({
            ...previousForm,

            displaySection: {
              ...previousForm
                .displaySection,

              items:
                previousForm
                  .displaySection
                  .items.filter(
                    (
                      _,
                      itemIndex,
                    ) =>
                      itemIndex !==
                      index,
                  ),
            },
          }),
        );
      };

    /* =====================================================
       SECTION IMAGE UPLOAD
    ===================================================== */

    const handleImageUpload =
      async (
        event,
        section,
        field,
      ) => {
        const file =
          event.target
            .files?.[0];

        if (!file) {
          return;
        }

        const uploadKey =
          `${section}.${field}`;

        try {
          setErrorMessage("");

          setSuccessMessage("");

          setUploadingField(
            uploadKey,
          );

          const response =
            await uploadPageImage(
              file,
            );

          const imageUrl =
            response?.data
              ?.secure_url ||
            response?.data
              ?.url ||
            response
              ?.secure_url ||
            response?.url;

          if (!imageUrl) {
            throw new Error(
              "Image upload failed. URL was not received.",
            );
          }

          handleChange(
            section,
            field,
            imageUrl,
          );
        } catch (error) {
          console.error(
            error,
          );

          setErrorMessage(
            getErrorMessage(
              error,
              "Image upload failed.",
            ),
          );
        } finally {
          setUploadingField(
            "",
          );

          event.target.value =
            "";
        }
      };

    /* =====================================================
       DISPLAY IMAGE UPLOAD
    ===================================================== */

    const handleDisplayImageUpload =
      async (
        event,
        index,
      ) => {
        const file =
          event.target
            .files?.[0];

        if (!file) {
          return;
        }

        const uploadKey =
          `displaySection.items.${index}.image`;

        try {
          setErrorMessage("");

          setSuccessMessage("");

          setUploadingField(
            uploadKey,
          );

          const response =
            await uploadPageImage(
              file,
            );

          const imageUrl =
            response?.data
              ?.secure_url ||
            response?.data
              ?.url ||
            response
              ?.secure_url ||
            response?.url;

          if (!imageUrl) {
            throw new Error(
              "Display image upload failed. URL was not received.",
            );
          }

          handleDisplayItemChange(
            index,
            "image",
            imageUrl,
          );
        } catch (error) {
          console.error(
            error,
          );

          setErrorMessage(
            getErrorMessage(
              error,
              "Display image upload failed.",
            ),
          );
        } finally {
          setUploadingField(
            "",
          );

          event.target.value =
            "";
        }
      };

    /* =====================================================
       PDF UPLOAD
    ===================================================== */

    const handlePdfUpload =
      async (
        event,
        index,
      ) => {
        const file =
          event.target
            .files?.[0];

        if (!file) {
          return;
        }

        const isPdf =
          file.type ===
            "application/pdf" ||
          file.name
            .toLowerCase()
            .endsWith(
              ".pdf",
            );

        if (!isPdf) {
          setErrorMessage(
            "Please select a valid PDF file.",
          );

          event.target.value =
            "";

          return;
        }

        const uploadKey =
          `displaySection.items.${index}.pdf`;

        try {
          setErrorMessage("");

          setSuccessMessage("");

          setUploadingField(
            uploadKey,
          );

          const response =
            await uploadPagePdf(
              file,
            );

          const pdfData =
            response?.data ||
            response;

          const pdfUrl =
            pdfData?.pdfUrl ||
            pdfData?.url ||
            pdfData
              ?.relativeUrl;

          if (!pdfUrl) {
            throw new Error(
              "PDF upload failed. URL was not received.",
            );
          }

          setForm(
            (
              previousForm,
            ) => {
              const updatedItems =
                [
                  ...previousForm
                    .displaySection
                    .items,
                ];

              updatedItems[
                index
              ] = {
                ...updatedItems[
                  index
                ],

                pdfUrl,

                pdfName:
                  pdfData?.fileName ||
                  pdfData
                    ?.originalName ||
                  file.name,
              };

              return {
                ...previousForm,

                displaySection: {
                  ...previousForm
                    .displaySection,

                  items:
                    updatedItems,
                },
              };
            },
          );
        } catch (error) {
          console.error(
            error,
          );

          setErrorMessage(
            getErrorMessage(
              error,
              "PDF upload failed.",
            ),
          );
        } finally {
          setUploadingField(
            "",
          );

          event.target.value =
            "";
        }
      };

    /* =====================================================
       REMOVE PDF
    ===================================================== */

    const handleRemovePdf =
      (index) => {
        const shouldRemove =
          window.confirm(
            "Remove this PDF from the display item?",
          );

        if (
          !shouldRemove
        ) {
          return;
        }

        setForm(
          (
            previousForm,
          ) => {
            const updatedItems =
              [
                ...previousForm
                  .displaySection
                  .items,
              ];

            updatedItems[
              index
            ] = {
              ...updatedItems[
                index
              ],

              pdfUrl: "",
              pdfName: "",
            };

            return {
              ...previousForm,

              displaySection: {
                ...previousForm
                  .displaySection,

                items:
                  updatedItems,
              },
            };
          },
        );
      };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm =
      () => {
        if (
          !form.hero
            .headingLine1
            .trim()
        ) {
          return "Hero heading line 1 is required.";
        }

        if (
          !form.displaySection
            .heading
            .trim()
        ) {
          return "Display program heading is required.";
        }

        for (
          let index = 0;
          index <
          form
            .displaySection
            .items.length;
          index += 1
        ) {
          const item =
            form
              .displaySection
              .items[index];

          if (
            !item.name.trim()
          ) {
            return `Display Item ${
              index + 1
            }: display name is required.`;
          }
        }

        return "";
      };

    /* =====================================================
       SAVE
    ===================================================== */

    const handleSave =
      async () => {
        const validationError =
          validateForm();

        if (
          validationError
        ) {
          setErrorMessage(
            validationError,
          );

          return;
        }

        if (!pageId) {
          setErrorMessage(
            "Page ID is missing. Please refresh the page.",
          );

          return;
        }

        try {
          setSaving(true);

          setErrorMessage("");

          setSuccessMessage("");

          const content = {
            /* =============================================
               HERO
            ============================================= */

            hero: {
              image:
                form.hero.image,

              imageAlt:
                form.hero.imageAlt.trim(),

              eyebrow:
                form.hero.eyebrow.trim(),

              headingLine1:
                form.hero.headingLine1.trim(),

              headingLine2:
                form.hero.headingLine2.trim(),

              description:
                form.hero.description.trim(),

              buttonText:
                form.hero.buttonText.trim() ||
                "Request a Display",
            },

            /* =============================================
               DISPLAY PROGRAM
            ============================================= */

            displaySection: {
              eyebrow:
                form.displaySection.eyebrow.trim(),

              heading:
                form.displaySection.heading.trim(),

              description:
                form.displaySection.description.trim(),

              image:
                form.displaySection.image,

              imageAlt:
                form.displaySection.imageAlt.trim(),

              items:
                form.displaySection.items.map(
                  (
                    item,
                    index,
                  ) => ({
                    id:
                      index +
                      1,

                    name:
                      item.name.trim(),

                    description:
                      item.description.trim(),

                    size:
                      item.size.trim(),

                    image:
                      item.image,

                    imageAlt:
                      item.imageAlt.trim(),

                    detailLink:
                      item.detailLink.trim(),

                    pdfUrl:
                      item.pdfUrl,

                    pdfName:
                      item.pdfName,

                    buttonText:
                      item.buttonText.trim() ||
                      "Download Spec Sheet",
                  }),
                ),
            },

            /* =============================================
               CTA
            ============================================= */

            cta: {
              image:
                form.cta.image,

              imageAlt:
                form.cta.imageAlt.trim(),

              eyebrow:
                form.cta.eyebrow.trim(),

              titleLine1:
                form.cta.titleLine1.trim(),

              titleLine2:
                form.cta.titleLine2.trim(),

              description:
                form.cta.description.trim(),

              buttonText:
                form.cta.buttonText.trim(),

              buttonLink:
                form.cta.buttonLink.trim(),
            },
          };

          await updatePage(
            pageId,
            {
              slug:
                PAGE_SLUG,

              title:
                "Merchandising Displays",

              status:
                "published",

              content,
            },
          );

          setSuccessMessage(
            "Merchandising Displays page updated successfully.",
          );
        } catch (error) {
          console.error(
            error,
          );

          setErrorMessage(
            getErrorMessage(
              error,
              "Failed to update Merchandising Displays page.",
            ),
          );
        } finally {
          setSaving(
            false,
          );
        }
      };

    /* =====================================================
       STATUS
    ===================================================== */

    const isUploading =
      Boolean(
        uploadingField,
      );

    const getSaveButtonLabel =
      () => {
        if (saving) {
          return "Saving...";
        }

        if (
          isUploading
        ) {
          return "Upload in Progress...";
        }

        return "Save Changes";
      };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
      return (
        <Box
          sx={{
            display:
              "flex",

            justifyContent:
              "center",

            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    /* =====================================================
       UI
    ===================================================== */

    return (
      <Box
        sx={{
          minHeight:
            "100vh",

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
            Merchandising Displays
            Page CMS
          </Typography>

          <Box
            sx={{
              width: 70,
              height: 4,

              background:
                "#c91f26",

              mb: 4,
            }}
          />

          {/* ===============================================
              ALERTS
          =============================================== */}

          {errorMessage && (
            <Alert
              severity="error"
              onClose={() =>
                setErrorMessage(
                  "",
                )
              }
              sx={{
                mb: 3,
              }}
            >
              {
                errorMessage
              }
            </Alert>
          )}

          {successMessage && (
            <Alert
              severity="success"
              onClose={() =>
                setSuccessMessage(
                  "",
                )
              }
              sx={{
                mb: 3,
              }}
            >
              {
                successMessage
              }
            </Alert>
          )}

          {/* ===============================================
              HERO SECTION
          =============================================== */}

          <Card
            sx={{
              mb: 4,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                mb={3}
              >
                Hero Section
              </Typography>

              <Grid
                container
                spacing={4}
              >
                {/* IMAGE */}

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
                    sx={{
                      mb: 2,
                    }}
                  >
                    {getImageUploadLabel({
                      isUploading:
                        uploadingField ===
                        "hero.image",

                      hasImage:
                        Boolean(
                          form.hero
                            .image,
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
                      onChange={(
                        event,
                      ) =>
                        handleImageUpload(
                          event,
                          "hero",
                          "image",
                        )
                      }
                    />
                  </Button>

                  <TextField
                    fullWidth
                    label="Hero Image URL"
                    value={
                      form.hero
                        .image
                    }
                    InputProps={{
                      readOnly:
                        true,
                    }}
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Hero Image Alt Text"
                    value={
                      form.hero
                        .imageAlt
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "hero",
                        "imageAlt",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  {form.hero.image && (
                    <Box
                      component="img"
                      src={
                        form.hero
                          .image
                      }
                      alt={
                        form.hero
                          .imageAlt ||
                        "Hero preview"
                      }
                      sx={{
                        width:
                          "100%",

                        height:
                          340,

                        objectFit:
                          "cover",

                        borderRadius:
                          1,
                      }}
                    />
                  )}
                </Grid>

                {/* CONTENT */}

                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <TextField
                    fullWidth
                    label="Eyebrow"
                    value={
                      form.hero
                        .eyebrow
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "hero",
                        "eyebrow",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    required
                    label="Heading Line 1"
                    value={
                      form.hero
                        .headingLine1
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "hero",
                        "headingLine1",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Heading Line 2"
                    value={
                      form.hero
                        .headingLine2
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "hero",
                        "headingLine2",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Description"
                    value={
                      form.hero
                        .description
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "hero",
                        "description",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Button Text"
                    value={
                      form.hero
                        .buttonText
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "hero",
                        "buttonText",
                        event.target
                          .value,
                      )
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ===============================================
              DISPLAY PROGRAM
          =============================================== */}

          <Card
            sx={{
              mb: 4,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                mb={3}
              >
                Display Program
                Introduction
              </Typography>

              <Grid
                container
                spacing={4}
              >
                {/* CONTENT */}

                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <TextField
                    fullWidth
                    label="Eyebrow"
                    value={
                      form
                        .displaySection
                        .eyebrow
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "displaySection",
                        "eyebrow",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    required
                    multiline
                    minRows={2}
                    label="Heading"
                    value={
                      form
                        .displaySection
                        .heading
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "displaySection",
                        "heading",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    minRows={6}
                    label="Description"
                    value={
                      form
                        .displaySection
                        .description
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "displaySection",
                        "description",
                        event.target
                          .value,
                      )
                    }
                  />
                </Grid>

                {/* FEATURE IMAGE */}

                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    mb={2}
                  >
                    Featured Display
                    Image
                  </Typography>

                  <Button
                    variant="outlined"
                    component="label"
                    disabled={
                      uploadingField ===
                      "displaySection.image"
                    }
                    sx={{
                      mb: 2,
                    }}
                  >
                    {getImageUploadLabel({
                      isUploading:
                        uploadingField ===
                        "displaySection.image",

                      hasImage:
                        Boolean(
                          form
                            .displaySection
                            .image,
                        ),

                      uploadLabel:
                        "Upload Feature Image",

                      replaceLabel:
                        "Replace Feature Image",
                    })}

                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(
                        event,
                      ) =>
                        handleImageUpload(
                          event,
                          "displaySection",
                          "image",
                        )
                      }
                    />
                  </Button>

                  <TextField
                    fullWidth
                    label="Feature Image URL"
                    value={
                      form
                        .displaySection
                        .image
                    }
                    InputProps={{
                      readOnly:
                        true,
                    }}
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Feature Image Alt Text"
                    value={
                      form
                        .displaySection
                        .imageAlt
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "displaySection",
                        "imageAlt",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  {form
                    .displaySection
                    .image && (
                    <Box
                      sx={{
                        background:
                          "#f5f5f5",

                        minHeight:
                          320,

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        p: 3,

                        borderRadius:
                          1,
                      }}
                    >
                      <Box
                        component="img"
                        src={
                          form
                            .displaySection
                            .image
                        }
                        alt={
                          form
                            .displaySection
                            .imageAlt ||
                          "Feature display"
                        }
                        sx={{
                          width:
                            "100%",

                          height:
                            300,

                          objectFit:
                            "contain",
                        }}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ===============================================
              DISPLAY ITEMS
          =============================================== */}

          <Card
            sx={{
              mb: 4,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display:
                    "flex",

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

                  mb: 4,
                }}
              >
                <Box>
                  <Typography variant="h6">
                    Merchandising
                    Displays
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={0.5}
                  >
                    {
                      form
                        .displaySection
                        .items.length
                    }{" "}
                    display
                    {form
                      .displaySection
                      .items.length ===
                    1
                      ? ""
                      : "s"}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  onClick={
                    handleAddDisplay
                  }
                  disabled={
                    isUploading
                  }
                  sx={{
                    background:
                      "#c91f26",

                    "&:hover": {
                      background:
                        "#aa1a20",
                    },
                  }}
                >
                  Add More Display
                </Button>
              </Box>

              {/* NO ITEMS */}

              {form
                .displaySection
                .items.length ===
                0 && (
                <Box
                  sx={{
                    py: 6,

                    px: 2,

                    textAlign:
                      "center",

                    border:
                      "1px dashed",

                    borderColor:
                      "divider",

                    borderRadius:
                      1,
                  }}
                >
                  <Typography
                    color="text.secondary"
                    mb={2}
                  >
                    No displays have
                    been added.
                  </Typography>

                  <Button
                    variant="outlined"
                    onClick={
                      handleAddDisplay
                    }
                  >
                    Add First Display
                  </Button>
                </Box>
              )}

              {/* ITEMS */}

              {form
                .displaySection
                .items.map(
                  (
                    item,
                    index,
                  ) => {
                    const imageUploadKey =
                      `displaySection.items.${index}.image`;

                    const pdfUploadKey =
                      `displaySection.items.${index}.pdf`;

                    return (
                      <Box
                        key={
                          item.id
                        }
                      >
                        {/* HEADER */}

                        <Box
                          sx={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "space-between",

                            gap: 2,

                            mb: 3,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={
                              600
                            }
                          >
                            {String(
                              index + 1,
                            ).padStart(
                              2,
                              "0",
                            )}
                            {" — "}
                            {item.name ||
                              "Display Item"}
                          </Typography>

                          <Button
                            variant="outlined"
                            color="error"
                            disabled={
                              isUploading
                            }
                            onClick={() =>
                              handleRemoveDisplay(
                                index,
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
                          {/* IMAGE */}

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
                              sx={{
                                mb: 2,
                              }}
                            >
                              {getImageUploadLabel({
                                isUploading:
                                  uploadingField ===
                                  imageUploadKey,

                                hasImage:
                                  Boolean(
                                    item.image,
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
                                onChange={(
                                  event,
                                ) =>
                                  handleDisplayImageUpload(
                                    event,
                                    index,
                                  )
                                }
                              />
                            </Button>

                            <TextField
                              fullWidth
                              label="Image URL"
                              value={
                                item.image
                              }
                              InputProps={{
                                readOnly:
                                  true,
                              }}
                              sx={{
                                mb: 2,
                              }}
                            />

                            <TextField
                              fullWidth
                              label="Image Alt Text"
                              value={
                                item.imageAlt
                              }
                              onChange={(
                                event,
                              ) =>
                                handleDisplayItemChange(
                                  index,
                                  "imageAlt",
                                  event.target
                                    .value,
                                )
                              }
                              sx={{
                                mb: 2,
                              }}
                            />

                            {item.image && (
                              <Box
                                sx={{
                                  minHeight:
                                    320,

                                  background:
                                    "#f5f5f5",

                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  justifyContent:
                                    "center",

                                  p: 3,

                                  borderRadius:
                                    1,
                                }}
                              >
                                <Box
                                  component="img"
                                  src={
                                    item.image
                                  }
                                  alt={
                                    item.imageAlt ||
                                    item.name ||
                                    "Display preview"
                                  }
                                  sx={{
                                    width:
                                      "100%",

                                    height:
                                      300,

                                    objectFit:
                                      "contain",
                                  }}
                                />
                              </Box>
                            )}
                          </Grid>

                          {/* CONTENT */}

                          <Grid
                            item
                            xs={12}
                            md={7}
                          >
                            <TextField
                              fullWidth
                              required
                              label="Display Name"
                              value={
                                item.name
                              }
                              onChange={(
                                event,
                              ) =>
                                handleDisplayItemChange(
                                  index,
                                  "name",
                                  event.target
                                    .value,
                                )
                              }
                              sx={{
                                mb: 2,
                              }}
                            />

                            <TextField
                              fullWidth
                              multiline
                              minRows={3}
                              label="Display Description"
                              value={
                                item.description
                              }
                              onChange={(
                                event,
                              ) =>
                                handleDisplayItemChange(
                                  index,
                                  "description",
                                  event.target
                                    .value,
                                )
                              }
                              placeholder="Compact presentation system designed to showcase curated surface samples."
                              sx={{
                                mb: 2,
                              }}
                            />

                            <TextField
                              fullWidth
                              label="Display Size"
                              placeholder='21"W × 70¾"H × 24½"W'
                              value={
                                item.size
                              }
                              onChange={(
                                event,
                              ) =>
                                handleDisplayItemChange(
                                  index,
                                  "size",
                                  event.target
                                    .value,
                                )
                              }
                              sx={{
                                mb: 2,
                              }}
                            />

                            <TextField
                              fullWidth
                              label="View Details Link"
                              placeholder="/merchandising-displays/ultra-quartz-tower"
                              value={
                                item.detailLink
                              }
                              onChange={(
                                event,
                              ) =>
                                handleDisplayItemChange(
                                  index,
                                  "detailLink",
                                  event.target
                                    .value,
                                )
                              }
                              helperText="Optional. Leave empty if there is no detail page."
                              sx={{
                                mb: 2,
                              }}
                            />

                            <TextField
                              fullWidth
                              label="PDF Button Text"
                              value={
                                item.buttonText
                              }
                              onChange={(
                                event,
                              ) =>
                                handleDisplayItemChange(
                                  index,
                                  "buttonText",
                                  event.target
                                    .value,
                                )
                              }
                              sx={{
                                mb: 3,
                              }}
                            />

                            {/* PDF */}

                            <Typography
                              variant="subtitle2"
                              fontWeight={
                                600
                              }
                              mb={1.5}
                            >
                              Display Spec
                              Sheet
                            </Typography>

                            <Box
                              sx={{
                                display:
                                  "flex",

                                gap: 1,

                                flexWrap:
                                  "wrap",

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

                                  hasPdf:
                                    Boolean(
                                      item.pdfUrl,
                                    ),
                                })}

                                <input
                                  hidden
                                  type="file"
                                  accept="application/pdf,.pdf"
                                  onChange={(
                                    event,
                                  ) =>
                                    handlePdfUpload(
                                      event,
                                      index,
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
                                        index,
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
                                readOnly:
                                  true,
                              }}
                              helperText={
                                item.pdfUrl
                                  ? "PDF uploaded successfully."
                                  : "Upload the display specification PDF."
                              }
                            />
                          </Grid>
                        </Grid>

                        {index <
                          form
                            .displaySection
                            .items.length -
                            1 && (
                          <Divider
                            sx={{
                              my: 5,
                            }}
                          />
                        )}
                      </Box>
                    );
                  },
                )}

              {/* ADD BOTTOM */}

              {form
                .displaySection
                .items.length >
                0 && (
                <Box
                  sx={{
                    mt: 5,

                    display:
                      "flex",

                    justifyContent:
                      "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={
                      handleAddDisplay
                    }
                    disabled={
                      isUploading
                    }
                    sx={{
                      px: 4,
                    }}
                  >
                    Add More Display
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* ===============================================
              BOTTOM SHOWROOM SECTION
          =============================================== */}

          <Card
            sx={{
              mb: 4,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                mb={3}
              >
                Bottom Showroom
                Section
              </Typography>

              <Grid
                container
                spacing={4}
              >
                {/* IMAGE */}

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
                    sx={{
                      mb: 2,
                    }}
                  >
                    {getImageUploadLabel({
                      isUploading:
                        uploadingField ===
                        "cta.image",

                      hasImage:
                        Boolean(
                          form.cta
                            .image,
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
                      onChange={(
                        event,
                      ) =>
                        handleImageUpload(
                          event,
                          "cta",
                          "image",
                        )
                      }
                    />
                  </Button>

                  <TextField
                    fullWidth
                    label="CTA Image URL"
                    value={
                      form.cta
                        .image
                    }
                    InputProps={{
                      readOnly:
                        true,
                    }}
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Image Alt Text"
                    value={
                      form.cta
                        .imageAlt
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "cta",
                        "imageAlt",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  {form.cta.image && (
                    <Box
                      sx={{
                        background:
                          "#f5f5f5",

                        p: 3,

                        minHeight:
                          320,

                        display:
                          "flex",

                        justifyContent:
                          "center",

                        alignItems:
                          "center",

                        borderRadius:
                          1,
                      }}
                    >
                      <Box
                        component="img"
                        src={
                          form.cta
                            .image
                        }
                        alt={
                          form.cta
                            .imageAlt ||
                          "CTA preview"
                        }
                        sx={{
                          width:
                            "100%",

                          height:
                            300,

                          objectFit:
                            "contain",
                        }}
                      />
                    </Box>
                  )}
                </Grid>

                {/* CONTENT */}

                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <TextField
                    fullWidth
                    label="Eyebrow"
                    value={
                      form.cta
                        .eyebrow
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "cta",
                        "eyebrow",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Title Line 1"
                    value={
                      form.cta
                        .titleLine1
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "cta",
                        "titleLine1",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Title Line 2"
                    value={
                      form.cta
                        .titleLine2
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "cta",
                        "titleLine2",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Description"
                    value={
                      form.cta
                        .description
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "cta",
                        "description",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Button Text"
                    value={
                      form.cta
                        .buttonText
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "cta",
                        "buttonText",
                        event.target
                          .value,
                      )
                    }
                    sx={{
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Button Link"
                    value={
                      form.cta
                        .buttonLink
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "cta",
                        "buttonLink",
                        event.target
                          .value,
                      )
                    }
                    placeholder="/contact"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ===============================================
              SAVE
          =============================================== */}

          <Button
            variant="contained"
            onClick={
              handleSave
            }
            disabled={
              saving ||
              isUploading ||
              !pageId
            }
            sx={{
              background:
                "#c91f26",

              px: 5,
              py: 1.4,

              "&:hover": {
                background:
                  "#aa1a20",
              },
            }}
          >
            {
              getSaveButtonLabel()
            }
          </Button>
        </Container>
      </Box>
    );
  };

export default MerchandisingDisplays;