import React, {
  useState,
  useEffect,
} from "react";

import {
  Box,
  Card,
  Grid,
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
  uploadPageImage,
} from "../../../services/pages.service";

/* =========================================================
   DEFAULT FORM DATA
========================================================= */

const DEFAULT_FORM = {
  /* ===================== HERO ===================== */

  hero: {
    eyebrow: "About Ultra Stones",

    headingLine1:
      "A passion for stone.",

    headingLine2:
      "A commitment to",

    headingLine3:
      "excellence.",

    description:
      "Since 2013, Ultra Stones has connected exceptional natural stone and engineered surfaces with extraordinary spaces.",

    meta: "EST. 2013 · USA",

    image: "",

    imageAlt:
      "Ultra Stones natural stone quarry",
  },

  /* ================= WHO WE ARE ================= */

  whoWeAre: {
    eyebrow: "Who We Are",

    titleLine1:
      "More than stone.",

    titleLine2:
      "A partner in every project.",

    paragraphs: [
      "Ultra Stones is a leading importer and distributor of premium natural stone and engineered surfaces. We work closely with quarries and manufacturers around the world to bring exceptional materials to architects, designers, fabricators, builders, dealers and homeowners.",

      "From timeless classics to the latest innovations, our collection is curated to inspire and built to perform.",
    ],

    buttonLabel:
      "Explore Our Products",

    buttonLink:
      "/material-portfolio",

    image: "",

    imageAlt:
      "Ultra Stones warehouse",
  },

  /* ===================== STATS ===================== */

  stats: [
    {
      value: "2013",
      label: "ESTABLISHED",
    },
    {
      value: "650+",
      label: "PREMIUM SURFACES",
    },
    {
      value: "GLOBAL",
      label: "SOURCING NETWORK",
    },
    {
      value: "USA",
      label: "WAREHOUSE PRESENCE",
    },
  ],

  /* ==================== JOURNEY ==================== */

  journey: {
    eyebrow: "Our Journey",

    titleLine1:
      "Built on stone.",

    titleLine2:
      "Driven by possibility.",

    items: [
      {
        year: "2013",

        title:
          "The Beginning",

        description:
          "Ultra Stones begins its journey in Farmingdale, New York.",
      },

      {
        year: "GROWTH",

        title:
          "Expansion",

        description:
          "We expand our inventory, collections and relationships across the stone industry.",
      },

      {
        year:
          "PENNSYLVANIA",

        title:
          "New Location",

        description:
          "Our Pennsylvania presence expands our reach and strengthens our service.",
      },

      {
        year: "TODAY",

        title:
          "Moving Forward",

        description:
          "Continuing to bring exceptional surfaces to projects across the United States.",
      },
    ],
  },

  /* ==================== PROCESS ==================== */

  processSection: {
    eyebrow:
      "From Source To Space",

    titleLine1:
      "Every surface",

    titleLine2:
      "has a journey.",

    description:
      "We source the finest materials, select them with care, and deliver them for the spaces that inspire.",

    buttonLabel:
      "Our Process",

    buttonLink:
      "/our-process",

    items: [
      {
        number: "01",

        title: "SOURCE",

        description:
          "Carefully sourced from the world's finest stone producers.",

        image: "",

        imageAlt:
          "Natural stone source",
      },

      {
        number: "02",

        title: "SELECT",

        description:
          "Handpicked for quality, beauty and lasting performance.",

        image: "",

        imageAlt:
          "Stone selection",
      },

      {
        number: "03",

        title: "SPACE",

        description:
          "Transformed into extraordinary architectural spaces.",

        image: "",

        imageAlt:
          "Finished stone space",
      },
    ],
  },

  /* ==================== VISIT US ==================== */

  visitUs: {
    eyebrow: "Visit Us",

    titleLine1:
      "Experience our",

    titleLine2:
      "collection in person.",

    locations: [
      {
        name: "NEW YORK",

        city:
          "Farmingdale, NY",

        image: "",

        imageAlt:
          "Ultra Stones New York location",

        buttonLabel:
          "View Location",

        buttonLink:
          "/contact-us",
      },

      {
        name:
          "PENNSYLVANIA",

        city:
          "Levittown, PA",

        image: "",

        imageAlt:
          "Ultra Stones Pennsylvania location",

        buttonLabel:
          "View Location",

        buttonLink:
          "/contact-us",
      },
    ],
  },
};

/* =========================================================
   COMPONENT
========================================================= */

const Aboutus = () => {
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
    form,
    setForm,
  ] = useState(
    DEFAULT_FORM,
  );

  /* =======================================================
     FETCH PAGE
  ======================================================= */

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage =
    async () => {
      try {
        const response =
          await getPageBySlug(
            "about-us",
          );

        const page =
          response.data ||
          response;

        setPageId(page.id);

        const content =
          page.content ||
          {};

        setForm({
          /* HERO */

          hero: {
            ...DEFAULT_FORM.hero,
            ...(content.hero ||
              {}),
          },

          /* WHO WE ARE */

          whoWeAre: {
            ...DEFAULT_FORM.whoWeAre,
            ...(content.whoWeAre ||
              {}),

            paragraphs:
              content.whoWeAre
                ?.paragraphs
                ?.length
                ? content
                    .whoWeAre
                    .paragraphs
                : DEFAULT_FORM
                    .whoWeAre
                    .paragraphs,
          },

          /* STATS */

          stats:
            content.stats
              ?.length
              ? content.stats
              : DEFAULT_FORM.stats,

          /* JOURNEY */

          journey: {
            ...DEFAULT_FORM.journey,
            ...(content.journey ||
              {}),

            items:
              content.journey
                ?.items?.length
                ? content
                    .journey
                    .items
                : DEFAULT_FORM
                    .journey
                    .items,
          },

          /* PROCESS */

          processSection: {
            ...DEFAULT_FORM.processSection,
            ...(content.processSection ||
              {}),

            items:
              content
                .processSection
                ?.items?.length
                ? content
                    .processSection
                    .items
                : DEFAULT_FORM
                    .processSection
                    .items,
          },

          /* VISIT US */

          visitUs: {
            ...DEFAULT_FORM.visitUs,
            ...(content.visitUs ||
              {}),

            locations:
              content.visitUs
                ?.locations
                ?.length
                ? content
                    .visitUs
                    .locations
                : DEFAULT_FORM
                    .visitUs
                    .locations,
          },
        });
      } catch (error) {
        console.error(
          error,
        );

        alert(
          error.message,
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  /* =======================================================
     BASIC SECTION CHANGE
  ======================================================= */

  const handleChange = (
    section,
    field,
    value,
  ) => {
    setForm((prev) => ({
      ...prev,

      [section]: {
        ...prev[section],

        [field]:
          value,
      },
    }));
  };

  /* =======================================================
     WHO WE ARE PARAGRAPHS
  ======================================================= */

  const handleWhoParagraphChange =
    (
      index,
      value,
    ) => {
      setForm(
        (prev) => {
          const paragraphs =
            [
              ...prev
                .whoWeAre
                .paragraphs,
            ];

          paragraphs[
            index
          ] = value;

          return {
            ...prev,

            whoWeAre: {
              ...prev.whoWeAre,

              paragraphs,
            },
          };
        },
      );
    };

  /* =======================================================
     STAT CHANGE
  ======================================================= */

  const handleStatChange = (
    index,
    field,
    value,
  ) => {
    setForm((prev) => {
      const stats = [
        ...prev.stats,
      ];

      stats[index] = {
        ...stats[index],

        [field]:
          value,
      };

      return {
        ...prev,
        stats,
      };
    });
  };

  /* =======================================================
     JOURNEY CHANGE
  ======================================================= */

  const handleJourneyChange =
    (
      index,
      field,
      value,
    ) => {
      setForm(
        (prev) => {
          const items = [
            ...prev
              .journey
              .items,
          ];

          items[index] = {
            ...items[
              index
            ],

            [field]:
              value,
          };

          return {
            ...prev,

            journey: {
              ...prev.journey,

              items,
            },
          };
        },
      );
    };

  /* =======================================================
     PROCESS CHANGE
  ======================================================= */

  const handleProcessChange =
    (
      index,
      field,
      value,
    ) => {
      setForm(
        (prev) => {
          const items = [
            ...prev
              .processSection
              .items,
          ];

          items[index] = {
            ...items[
              index
            ],

            [field]:
              value,
          };

          return {
            ...prev,

            processSection:
              {
                ...prev.processSection,

                items,
              },
          };
        },
      );
    };

  /* =======================================================
     LOCATION CHANGE
  ======================================================= */

  const handleLocationChange =
    (
      index,
      field,
      value,
    ) => {
      setForm(
        (prev) => {
          const locations =
            [
              ...prev
                .visitUs
                .locations,
            ];

          locations[
            index
          ] = {
            ...locations[
              index
            ],

            [field]:
              value,
          };

          return {
            ...prev,

            visitUs: {
              ...prev.visitUs,

              locations,
            },
          };
        },
      );
    };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageUpload =
    async (
      event,
      {
        section,
        field,
        index = null,
      },
    ) => {
      try {
        const file =
          event.target
            .files?.[0];

        if (!file) {
          return;
        }

        const uploadKey =
          index === null
            ? `${section}.${field}`
            : `${section}.${index}.${field}`;

        setUploadingField(
          uploadKey,
        );

        const response =
          await uploadPageImage(
            file,
          );

        const imageUrl =
          response.data
            ?.secure_url ||
          response
            .secure_url;

        if (!imageUrl) {
          throw new Error(
            "Image upload failed. URL not received.",
          );
        }

        /* PROCESS IMAGE */

        if (
          section ===
            "processSection" &&
          index !== null
        ) {
          handleProcessChange(
            index,
            field,
            imageUrl,
          );

          return;
        }

        /* LOCATION IMAGE */

        if (
          section ===
            "visitUs" &&
          index !== null
        ) {
          handleLocationChange(
            index,
            field,
            imageUrl,
          );

          return;
        }

        /* NORMAL SECTION IMAGE */

        handleChange(
          section,
          field,
          imageUrl,
        );
      } catch (error) {
        console.error(
          error,
        );

        alert(
          error.message,
        );
      } finally {
        setUploadingField(
          "",
        );

        event.target.value =
          "";
      }
    };

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave =
    async () => {
      try {
        setSaving(true);

        await updatePage(
          pageId,
          {
            title:
              "About Us",

            status:
              "published",

            content:
              form,
          },
        );

        alert(
          "About Us page updated successfully",
        );
      } catch (error) {
        console.error(
          error,
        );

        alert(
          error.message,
        );
      } finally {
        setSaving(
          false,
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

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

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Box
      sx={{
        minHeight:
          "100vh",

        py: 4,
      }}
    >
      <Container maxWidth="xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <Typography
          variant="h4"
          fontWeight={600}
          mb={1}
        >
          About Us Page CMS
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Manage the content,
          images and locations
          displayed on the About
          Us page.
        </Typography>

        <Box
          sx={{
            width: 70,

            height: 4,

            background:
              "#c91f26",

            mt: 2,

            mb: 4,
          }}
        />

        {/* =================================================
            HERO
        ================================================= */}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={3}
            >
              Hero Section
            </Typography>

            <Grid
              container
              spacing={4}
            >
              {/* TEXT */}

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
                  onChange={(e) =>
                    handleChange(
                      "hero",
                      "eyebrow",
                      e.target
                        .value,
                    )
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Heading Line 1"
                  value={
                    form.hero
                      .headingLine1
                  }
                  onChange={(e) =>
                    handleChange(
                      "hero",
                      "headingLine1",
                      e.target
                        .value,
                    )
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Heading Line 2"
                  value={
                    form.hero
                      .headingLine2
                  }
                  onChange={(e) =>
                    handleChange(
                      "hero",
                      "headingLine2",
                      e.target
                        .value,
                    )
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Heading Line 3"
                  value={
                    form.hero
                      .headingLine3
                  }
                  onChange={(e) =>
                    handleChange(
                      "hero",
                      "headingLine3",
                      e.target
                        .value,
                    )
                  }
                  sx={{ mb: 2 }}
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
                  onChange={(e) =>
                    handleChange(
                      "hero",
                      "description",
                      e.target
                        .value,
                    )
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Meta Text"
                  value={
                    form.hero
                      .meta
                  }
                  onChange={(e) =>
                    handleChange(
                      "hero",
                      "meta",
                      e.target
                        .value,
                    )
                  }
                />
              </Grid>

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
                  sx={{ mb: 2 }}
                >
                  {uploadingField ===
                  "hero.image"
                    ? "Uploading..."
                    : "Upload Hero Image"}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(
                        e,
                        {
                          section:
                            "hero",

                          field:
                            "image",
                        },
                      )
                    }
                  />
                </Button>

                <TextField
                  fullWidth
                  label="Image URL"
                  value={
                    form.hero
                      .image
                  }
                  InputProps={{
                    readOnly:
                      true,
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Image Alt Text"
                  value={
                    form.hero
                      .imageAlt
                  }
                  onChange={(e) =>
                    handleChange(
                      "hero",
                      "imageAlt",
                      e.target
                        .value,
                    )
                  }
                  sx={{ mb: 2 }}
                />

                {form.hero
                  .image && (
                  <Box
                    component="img"
                    src={
                      form.hero
                        .image
                    }
                    alt={
                      form.hero
                        .imageAlt
                    }
                    sx={{
                      width:
                        "100%",

                      height:
                        320,

                      objectFit:
                        "cover",

                      borderRadius:
                        1,
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* =================================================
            WHO WE ARE
        ================================================= */}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={3}
            >
              Who We Are Section
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
                    "whoWeAre.image"
                  }
                  sx={{ mb: 2 }}
                >
                  {uploadingField ===
                  "whoWeAre.image"
                    ? "Uploading..."
                    : "Upload Section Image"}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(
                        e,
                        {
                          section:
                            "whoWeAre",

                          field:
                            "image",
                        },
                      )
                    }
                  />
                </Button>

                <TextField
                  fullWidth
                  label="Image URL"
                  value={
                    form
                      .whoWeAre
                      .image
                  }
                  InputProps={{
                    readOnly:
                      true,
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Image Alt Text"
                  value={
                    form
                      .whoWeAre
                      .imageAlt
                  }
                  onChange={(e) =>
                    handleChange(
                      "whoWeAre",
                      "imageAlt",
                      e.target
                        .value,
                    )
                  }
                  sx={{ mb: 2 }}
                />

                {form
                  .whoWeAre
                  .image && (
                  <Box
                    component="img"
                    src={
                      form
                        .whoWeAre
                        .image
                    }
                    alt={
                      form
                        .whoWeAre
                        .imageAlt
                    }
                    sx={{
                      width:
                        "100%",

                      height:
                        420,

                      objectFit:
                        "cover",

                      borderRadius:
                        1,
                    }}
                  />
                )}
              </Grid>

              {/* TEXT */}

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
                      .whoWeAre
                      .eyebrow
                  }
                  onChange={(e) =>
                    handleChange(
                      "whoWeAre",
                      "eyebrow",
                      e.target
                        .value,
                    )
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Title Line 1"
                  value={
                    form
                      .whoWeAre
                      .titleLine1
                  }
                  onChange={(e) =>
                    handleChange(
                      "whoWeAre",
                      "titleLine1",
                      e.target
                        .value,
                    )
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Title Line 2"
                  value={
                    form
                      .whoWeAre
                      .titleLine2
                  }
                  onChange={(e) =>
                    handleChange(
                      "whoWeAre",
                      "titleLine2",
                      e.target
                        .value,
                    )
                  }
                  sx={{ mb: 3 }}
                />

                {form
                  .whoWeAre
                  .paragraphs.map(
                    (
                      paragraph,
                      index,
                    ) => (
                      <TextField
                        key={
                          index
                        }
                        fullWidth
                        multiline
                        minRows={
                          3
                        }
                        label={`Paragraph ${
                          index +
                          1
                        }`}
                        value={
                          paragraph
                        }
                        onChange={(
                          e,
                        ) =>
                          handleWhoParagraphChange(
                            index,

                            e
                              .target
                              .value,
                          )
                        }
                        sx={{
                          mb: 2,
                        }}
                      />
                    ),
                  )}

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
                      label="Button Label"
                      value={
                        form
                          .whoWeAre
                          .buttonLabel
                      }
                      onChange={(
                        e,
                      ) =>
                        handleChange(
                          "whoWeAre",

                          "buttonLabel",

                          e
                            .target
                            .value,
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
                      label="Button Link"
                      value={
                        form
                          .whoWeAre
                          .buttonLink
                      }
                      onChange={(
                        e,
                      ) =>
                        handleChange(
                          "whoWeAre",

                          "buttonLink",

                          e
                            .target
                            .value,
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={3}
            >
              Statistics
            </Typography>

            <Grid
              container
              spacing={3}
            >
              {form.stats.map(
                (
                  stat,
                  index,
                ) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                    key={index}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        height:
                          "100%",
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          mb={2}
                        >
                          Stat{" "}
                          {index +
                            1}
                        </Typography>

                        <TextField
                          fullWidth
                          label="Value"
                          value={
                            stat.value
                          }
                          onChange={(
                            e,
                          ) =>
                            handleStatChange(
                              index,

                              "value",

                              e
                                .target
                                .value,
                            )
                          }
                          sx={{
                            mb: 2,
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Label"
                          value={
                            stat.label
                          }
                          onChange={(
                            e,
                          ) =>
                            handleStatChange(
                              index,

                              "label",

                              e
                                .target
                                .value,
                            )
                          }
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ),
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* =================================================
            OUR JOURNEY
        ================================================= */}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={3}
            >
              Our Journey
            </Typography>

            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
                md={4}
              >
                <TextField
                  fullWidth
                  label="Eyebrow"
                  value={
                    form
                      .journey
                      .eyebrow
                  }
                  onChange={(e) =>
                    handleChange(
                      "journey",

                      "eyebrow",

                      e.target
                        .value,
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
                  label="Title Line 1"
                  value={
                    form
                      .journey
                      .titleLine1
                  }
                  onChange={(e) =>
                    handleChange(
                      "journey",

                      "titleLine1",

                      e.target
                        .value,
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
                  label="Title Line 2"
                  value={
                    form
                      .journey
                      .titleLine2
                  }
                  onChange={(e) =>
                    handleChange(
                      "journey",

                      "titleLine2",

                      e.target
                        .value,
                    )
                  }
                />
              </Grid>
            </Grid>

            <Divider
              sx={{
                my: 4,
              }}
            />

            <Grid
              container
              spacing={3}
            >
              {form
                .journey
                .items.map(
                  (
                    item,
                    index,
                  ) => (
                    <Grid
                      item
                      xs={12}
                      md={6}
                      key={
                        index
                      }
                    >
                      <Card
                        variant="outlined"
                        sx={{
                          height:
                            "100%",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            fontWeight={
                              600
                            }
                            mb={
                              2
                            }
                          >
                            Timeline
                            Item{" "}
                            {index +
                              1}
                          </Typography>

                          <TextField
                            fullWidth
                            label="Year / Label"
                            value={
                              item.year
                            }
                            onChange={(
                              e,
                            ) =>
                              handleJourneyChange(
                                index,

                                "year",

                                e
                                  .target
                                  .value,
                              )
                            }
                            sx={{
                              mb: 2,
                            }}
                          />

                          <TextField
                            fullWidth
                            label="Title"
                            value={
                              item.title
                            }
                            onChange={(
                              e,
                            ) =>
                              handleJourneyChange(
                                index,

                                "title",

                                e
                                  .target
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
                            minRows={
                              3
                            }
                            label="Description"
                            value={
                              item.description
                            }
                            onChange={(
                              e,
                            ) =>
                              handleJourneyChange(
                                index,

                                "description",

                                e
                                  .target
                                  .value,
                              )
                            }
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ),
                )}
            </Grid>
          </CardContent>
        </Card>

        {/* =================================================
            SOURCE TO SPACE
        ================================================= */}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={3}
            >
              From Source To Space
            </Typography>

            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
                md={4}
              >
                <TextField
                  fullWidth
                  label="Eyebrow"
                  value={
                    form
                      .processSection
                      .eyebrow
                  }
                  onChange={(e) =>
                    handleChange(
                      "processSection",

                      "eyebrow",

                      e.target
                        .value,
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
                  label="Title Line 1"
                  value={
                    form
                      .processSection
                      .titleLine1
                  }
                  onChange={(e) =>
                    handleChange(
                      "processSection",

                      "titleLine1",

                      e.target
                        .value,
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
                  label="Title Line 2"
                  value={
                    form
                      .processSection
                      .titleLine2
                  }
                  onChange={(e) =>
                    handleChange(
                      "processSection",

                      "titleLine2",

                      e.target
                        .value,
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
                    form
                      .processSection
                      .description
                  }
                  onChange={(e) =>
                    handleChange(
                      "processSection",

                      "description",

                      e.target
                        .value,
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
                  label="Button Label"
                  value={
                    form
                      .processSection
                      .buttonLabel
                  }
                  onChange={(e) =>
                    handleChange(
                      "processSection",

                      "buttonLabel",

                      e.target
                        .value,
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
                  label="Button Link"
                  value={
                    form
                      .processSection
                      .buttonLink
                  }
                  onChange={(e) =>
                    handleChange(
                      "processSection",

                      "buttonLink",

                      e.target
                        .value,
                    )
                  }
                />
              </Grid>
            </Grid>

            <Divider
              sx={{
                my: 4,
              }}
            />

            <Grid
              container
              spacing={3}
            >
              {form
                .processSection
                .items.map(
                  (
                    item,
                    index,
                  ) => (
                    <Grid
                      item
                      xs={12}
                      md={4}
                      key={
                        index
                      }
                    >
                      <Card
                        variant="outlined"
                        sx={{
                          height:
                            "100%",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            fontWeight={
                              600
                            }
                            mb={
                              2
                            }
                          >
                            Process
                            Card{" "}
                            {index +
                              1}
                          </Typography>

                          <TextField
                            fullWidth
                            label="Number"
                            value={
                              item.number
                            }
                            onChange={(
                              e,
                            ) =>
                              handleProcessChange(
                                index,

                                "number",

                                e
                                  .target
                                  .value,
                              )
                            }
                            sx={{
                              mb: 2,
                            }}
                          />

                          <TextField
                            fullWidth
                            label="Title"
                            value={
                              item.title
                            }
                            onChange={(
                              e,
                            ) =>
                              handleProcessChange(
                                index,

                                "title",

                                e
                                  .target
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
                            minRows={
                              3
                            }
                            label="Description"
                            value={
                              item.description
                            }
                            onChange={(
                              e,
                            ) =>
                              handleProcessChange(
                                index,

                                "description",

                                e
                                  .target
                                  .value,
                              )
                            }
                            sx={{
                              mb: 3,
                            }}
                          />

                          <Button
                            variant="outlined"
                            component="label"
                            disabled={
                              uploadingField ===
                              `processSection.${index}.image`
                            }
                            sx={{
                              mb: 2,
                            }}
                          >
                            {uploadingField ===
                            `processSection.${index}.image`
                              ? "Uploading..."
                              : "Upload Image"}

                            <input
                              hidden
                              type="file"
                              accept="image/*"
                              onChange={(
                                e,
                              ) =>
                                handleImageUpload(
                                  e,
                                  {
                                    section:
                                      "processSection",

                                    field:
                                      "image",

                                    index,
                                  },
                                )
                              }
                            />
                          </Button>

                          <TextField
                            fullWidth
                            label="Image URL"
                            value={
                              item.image ||
                              ""
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
                              item.imageAlt ||
                              ""
                            }
                            onChange={(
                              e,
                            ) =>
                              handleProcessChange(
                                index,

                                "imageAlt",

                                e
                                  .target
                                  .value,
                              )
                            }
                            sx={{
                              mb: 2,
                            }}
                          />

                          {item.image && (
                            <Box
                              component="img"
                              src={
                                item.image
                              }
                              alt={
                                item.imageAlt
                              }
                              sx={{
                                width:
                                  "100%",

                                height:
                                  240,

                                objectFit:
                                  "cover",

                                borderRadius:
                                  1,
                              }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ),
                )}
            </Grid>
          </CardContent>
        </Card>

        {/* =================================================
            VISIT US
        ================================================= */}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={3}
            >
              Visit Us
            </Typography>

            {/* SECTION CONTENT */}

            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
                md={4}
              >
                <TextField
                  fullWidth
                  label="Eyebrow"
                  value={
                    form
                      .visitUs
                      .eyebrow
                  }
                  onChange={(e) =>
                    handleChange(
                      "visitUs",

                      "eyebrow",

                      e.target
                        .value,
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
                  label="Title Line 1"
                  value={
                    form
                      .visitUs
                      .titleLine1
                  }
                  onChange={(e) =>
                    handleChange(
                      "visitUs",

                      "titleLine1",

                      e.target
                        .value,
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
                  label="Title Line 2"
                  value={
                    form
                      .visitUs
                      .titleLine2
                  }
                  onChange={(e) =>
                    handleChange(
                      "visitUs",

                      "titleLine2",

                      e.target
                        .value,
                    )
                  }
                />
              </Grid>
            </Grid>

            <Divider
              sx={{
                my: 4,
              }}
            />

            {/* LOCATIONS */}

            <Grid
              container
              spacing={3}
            >
              {form
                .visitUs
                .locations.map(
                  (
                    location,
                    index,
                  ) => (
                    <Grid
                      item
                      xs={12}
                      md={6}
                      key={
                        index
                      }
                    >
                      <Card
                        variant="outlined"
                        sx={{
                          height:
                            "100%",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            fontWeight={
                              600
                            }
                            mb={
                              3
                            }
                          >
                            Location{" "}
                            {index +
                              1}
                          </Typography>

                          {/* LOCATION NAME */}

                          <TextField
                            fullWidth
                            label="Location Name"
                            value={
                              location.name ||
                              ""
                            }
                            onChange={(
                              e,
                            ) =>
                              handleLocationChange(
                                index,

                                "name",

                                e
                                  .target
                                  .value,
                              )
                            }
                            sx={{
                              mb: 2,
                            }}
                          />

                          {/* CITY */}

                          <TextField
                            fullWidth
                            label="City / State"
                            value={
                              location.city ||
                              ""
                            }
                            onChange={(
                              e,
                            ) =>
                              handleLocationChange(
                                index,

                                "city",

                                e
                                  .target
                                  .value,
                              )
                            }
                            sx={{
                              mb: 3,
                            }}
                          />

                          {/* BUILDING GRAPHIC */}

                          <Typography
                            variant="subtitle2"
                            fontWeight={
                              600
                            }
                            mb={
                              1.5
                            }
                          >
                            Building
                            Graphic
                          </Typography>

                          <Button
                            variant="outlined"
                            component="label"
                            disabled={
                              uploadingField ===
                              `visitUs.${index}.image`
                            }
                            sx={{
                              mb: 2,
                            }}
                          >
                            {uploadingField ===
                            `visitUs.${index}.image`
                              ? "Uploading..."
                              : "Upload Building PNG"}

                            <input
                              hidden
                              type="file"
                              accept="image/png,image/webp,image/*"
                              onChange={(
                                e,
                              ) =>
                                handleImageUpload(
                                  e,
                                  {
                                    section:
                                      "visitUs",

                                    field:
                                      "image",

                                    index,
                                  },
                                )
                              }
                            />
                          </Button>

                          {/* IMAGE URL */}

                          <TextField
                            fullWidth
                            label="Building Image URL"
                            value={
                              location.image ||
                              ""
                            }
                            InputProps={{
                              readOnly:
                                true,
                            }}
                            sx={{
                              mb: 2,
                            }}
                          />

                          {/* ALT */}

                          <TextField
                            fullWidth
                            label="Building Image Alt Text"
                            value={
                              location.imageAlt ||
                              ""
                            }
                            onChange={(
                              e,
                            ) =>
                              handleLocationChange(
                                index,

                                "imageAlt",

                                e
                                  .target
                                  .value,
                              )
                            }
                            sx={{
                              mb: 2,
                            }}
                          />

                          {/* BUILDING PREVIEW */}

                          {location.image && (
                            <Box
                              sx={{
                                width:
                                  "100%",

                                height:
                                  280,

                                mb: 3,

                                p: 2,

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                background:
                                  "#f5f3f0",

                                border:
                                  "1px solid",

                                borderColor:
                                  "divider",

                                borderRadius:
                                  1,

                                overflow:
                                  "hidden",
                              }}
                            >
                              <Box
                                component="img"
                                src={
                                  location.image
                                }
                                alt={
                                  location.imageAlt ||
                                  location.name
                                }
                                sx={{
                                  width:
                                    "100%",

                                  height:
                                    "100%",

                                  objectFit:
                                    "contain",
                                }}
                              />
                            </Box>
                          )}

                          {/* BUTTON */}

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
                                label="Button Label"
                                value={
                                  location.buttonLabel ||
                                  ""
                                }
                                onChange={(
                                  e,
                                ) =>
                                  handleLocationChange(
                                    index,

                                    "buttonLabel",

                                    e
                                      .target
                                      .value,
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
                                label="Button Link"
                                value={
                                  location.buttonLink ||
                                  ""
                                }
                                onChange={(
                                  e,
                                ) =>
                                  handleLocationChange(
                                    index,

                                    "buttonLink",

                                    e
                                      .target
                                      .value,
                                  )
                                }
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ),
                )}
            </Grid>
          </CardContent>
        </Card>

        {/* =================================================
            SAVE
        ================================================= */}

        <Box
          sx={{
            display: "flex",

            justifyContent:
              "flex-end",

            pb: 4,
          }}
        >
          <Button
            variant="contained"
            onClick={
              handleSave
            }
            disabled={
              saving ||
              Boolean(
                uploadingField,
              )
            }
            sx={{
              background:
                "#c91f26",

              px: 5,

              py: 1.4,

              minWidth:
                160,

              "&:hover": {
                background:
                  "#aa1a20",
              },
            }}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Aboutus;