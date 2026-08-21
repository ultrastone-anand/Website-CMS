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

import Iconify from "src/components/iconify";

import {
  updatePage,
  getPageBySlug,
  uploadPageImage,
} from "../../../services/pages.service";

/* =========================================================
   DEFAULT FORM
========================================================= */

const DEFAULT_FORM = {
  /* ===================== HERO ===================== */

  hero: {
    eyebrow:
      "Continuing Education",

    headingLine1:
      "CEU:",

    headingLine2:
      "Lunch and Learn",

    description:
      "Educational programs designed for architects and designers to explore natural stone, specification, performance and application.",

    image: "",

    imageAlt:
      "CEU Lunch and Learn",
  },

  /* ===================== COURSES ===================== */

  courses: [
    {
      title:
        "Natural Stone Principles",

      image: "",

      imageAlt:
        "Natural Stone Principles",

      eyebrow:
        "CEU Course for Architects & Designers",

      description:
        "This course provides a solid introduction to natural stone as a building material. Participants will learn about stone formation, composition, extraction, fabrication, and installation considerations.",

      objectives: [
        "Understand the basic composition of natural stone.",
        "Review stone classifications and applications.",
        "Learn fabrication and installation considerations.",
        "Explore sustainability and maintenance practices.",
      ],

      buttonText:
        "Request Course",
    },

    {
      title:
        "The Art of Specifying Natural Stone",

      image: "",

      imageAlt:
        "The Art of Specifying Natural Stone",

      eyebrow:
        "CEU Course for Architects & Designers",

      description:
        "Learn best practices for specifying natural stone and selecting the right materials for commercial and residential projects.",

      objectives: [
        "Understand specification requirements.",
        "Review common finish options.",
        "Learn stone performance characteristics.",
        "Apply specification principles to real projects.",
      ],

      buttonText:
        "Request Course",
    },

    {
      title:
        "Why Choose Natural Stone",

      image: "",

      imageAlt:
        "Why Choose Natural Stone",

      eyebrow:
        "CEU Course for Architects & Designers",

      description:
        "Explore the beauty, durability, sustainability, and long-term value that natural stone brings to architectural and interior design projects.",

      objectives: [
        "Understand sustainability benefits.",
        "Compare natural stone to alternative materials.",
        "Review lifecycle performance advantages.",
        "Explore design possibilities and applications.",
      ],

      buttonText:
        "Request Course",
    },
  ],
};

/* =========================================================
   COMPONENT
========================================================= */

const Ceu = () => {
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
            "ceu",
          );

        const page =
          response.data ||
          response;

        setPageId(
          page.id,
        );

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

          /* COURSES */

          courses:
            content.courses
              ?.length
              ? content.courses.map(
                  (
                    course,
                  ) => {
                    const defaultCourse =
                      {
                        title:
                          "",

                        image:
                          "",

                        imageAlt:
                          "",

                        eyebrow:
                          "CEU Course for Architects & Designers",

                        description:
                          "",

                        buttonText:
                          "Request Course",
                      };

                    return {
                      ...defaultCourse,

                      ...course,

                      objectives:
                        Array.isArray(
                          course.objectives,
                        )
                          ? course.objectives
                          : [],
                    };
                  },
                )
              : DEFAULT_FORM.courses,
        });
      } catch (error) {
        console.error(
          "Error fetching CEU page:",
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
     HERO CHANGE
  ======================================================= */

  const handleHeroChange = (
    field,
    value,
  ) => {
    setForm((prev) => ({
      ...prev,

      hero: {
        ...prev.hero,

        [field]:
          value,
      },
    }));
  };

  /* =======================================================
     COURSE CHANGE
  ======================================================= */

  const handleCourseChange = (
    index,
    field,
    value,
  ) => {
    setForm((prev) => {
      const courses = [
        ...prev.courses,
      ];

      courses[index] = {
        ...courses[index],

        [field]:
          value,
      };

      return {
        ...prev,
        courses,
      };
    });
  };

  /* =======================================================
     OBJECTIVE CHANGE
  ======================================================= */

  const handleObjectiveChange =
    (
      courseIndex,
      objectiveIndex,
      value,
    ) => {
      setForm(
        (prev) => {
          const courses =
            [
              ...prev.courses,
            ];

          const objectives =
            [
              ...(
                courses[
                  courseIndex
                ]
                  .objectives ||
                []
              ),
            ];

          objectives[
            objectiveIndex
          ] = value;

          courses[
            courseIndex
          ] = {
            ...courses[
              courseIndex
            ],

            objectives,
          };

          return {
            ...prev,
            courses,
          };
        },
      );
    };

  /* =======================================================
     ADD OBJECTIVE
  ======================================================= */

  const handleAddObjective =
    (
      courseIndex,
    ) => {
      setForm(
        (prev) => {
          const courses =
            [
              ...prev.courses,
            ];

          courses[
            courseIndex
          ] = {
            ...courses[
              courseIndex
            ],

            objectives: [
              ...(
                courses[
                  courseIndex
                ]
                  .objectives ||
                []
              ),

              "",
            ],
          };

          return {
            ...prev,
            courses,
          };
        },
      );
    };

  /* =======================================================
     REMOVE OBJECTIVE
  ======================================================= */

  const handleRemoveObjective =
    (
      courseIndex,
      objectiveIndex,
    ) => {
      setForm(
        (prev) => {
          const courses =
            [
              ...prev.courses,
            ];

          const objectives =
            [
              ...(
                courses[
                  courseIndex
                ]
                  .objectives ||
                []
              ),
            ];

          objectives.splice(
            objectiveIndex,
            1,
          );

          courses[
            courseIndex
          ] = {
            ...courses[
              courseIndex
            ],

            objectives,
          };

          return {
            ...prev,
            courses,
          };
        },
      );
    };

  /* =======================================================
     ADD COURSE
  ======================================================= */

  const handleAddCourse =
    () => {
      setForm(
        (prev) => ({
          ...prev,

          courses: [
            ...prev.courses,

            {
              title: "",

              image: "",

              imageAlt: "",

              eyebrow:
                "CEU Course for Architects & Designers",

              description:
                "",

              objectives: [
                "",
              ],

              buttonText:
                "Request Course",
            },
          ],
        }),
      );
    };

  /* =======================================================
     REMOVE COURSE
  ======================================================= */

  const handleRemoveCourse =
    (index) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to remove this course?",
        );

      if (!confirmed) {
        return;
      }

      setForm(
        (prev) => ({
          ...prev,

          courses:
            prev.courses.filter(
              (
                _,
                courseIndex,
              ) =>
                courseIndex !==
                index,
            ),
        }),
      );
    };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageUpload =
    async (
      event,
      {
        type,
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
          type === "hero"
            ? "hero.image"
            : `course.${index}.image`;

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

        /* HERO IMAGE */

        if (
          type === "hero"
        ) {
          handleHeroChange(
            "image",
            imageUrl,
          );

          return;
        }

        /* COURSE IMAGE */

        if (
          type ===
            "course" &&
          index !== null
        ) {
          handleCourseChange(
            index,
            "image",
            imageUrl,
          );
        }
      } catch (error) {
        console.error(
          "Image upload error:",
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
        if (!pageId) {
          throw new Error(
            "CEU page ID not found.",
          );
        }

        setSaving(true);

        await updatePage(
          pageId,
          {
            title:
              "CEU",

            status:
              "published",

            content:
              form,
          },
        );

        alert(
          "CEU page updated successfully",
        );
      } catch (error) {
        console.error(
          "Error updating CEU page:",
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
          CEU Page CMS
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Manage the CEU
          hero, courses,
          learning objectives
          and course images.
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

        <Card
          sx={{
            mb: 4,
          }}
        >
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
                      .eyebrow ||
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    handleHeroChange(
                      "eyebrow",

                      event
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
                  label="Heading Line 1"
                  value={
                    form.hero
                      .headingLine1 ||
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    handleHeroChange(
                      "headingLine1",

                      event
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
                  label="Heading Line 2"
                  value={
                    form.hero
                      .headingLine2 ||
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    handleHeroChange(
                      "headingLine2",

                      event
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
                  minRows={5}
                  label="Description"
                  value={
                    form.hero
                      .description ||
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    handleHeroChange(
                      "description",

                      event
                        .target
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
                  sx={{
                    mb: 2,
                  }}
                >
                  {uploadingField ===
                  "hero.image"
                    ? "Uploading..."
                    : "Upload Hero Image"}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(
                      event,
                    ) =>
                      handleImageUpload(
                        event,
                        {
                          type:
                            "hero",
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
                      .image ||
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
                    form.hero
                      .imageAlt ||
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    handleHeroChange(
                      "imageAlt",

                      event
                        .target
                        .value,
                    )
                  }
                  sx={{
                    mb: 2,
                  }}
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
            COURSES HEADER
        ================================================= */}

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

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                gap: 2,

                flexWrap:
                  "wrap",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={
                    600
                  }
                >
                  CEU Courses
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mt={0.5}
                >
                  {
                    form
                      .courses
                      .length
                  }{" "}
                  course
                  {form
                    .courses
                    .length !==
                  1
                    ? "s"
                    : ""}
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={
                  <Iconify icon="eva:plus-fill" />
                }
                onClick={
                  handleAddCourse
                }
                sx={{
                  background:
                    "#161412",

                  "&:hover": {
                    background:
                      "#c91f26",
                  },
                }}
              >
                Add Course
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* =================================================
            COURSE CARDS
        ================================================= */}

        {form.courses.map(
          (
            course,
            courseIndex,
          ) => (
            <Card
              key={
                courseIndex
              }
              sx={{
                mb: 4,
              }}
            >
              <CardContent>
                {/* COURSE HEADER */}

                <Box
                  sx={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    gap: 2,

                    mb: 3,

                    flexWrap:
                      "wrap",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={
                      600
                    }
                  >
                    Course{" "}
                    {courseIndex +
                      1}
                  </Typography>

                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={
                      <Iconify icon="eva:trash-2-fill" />
                    }
                    onClick={() =>
                      handleRemoveCourse(
                        courseIndex,
                      )
                    }
                  >
                    Remove
                  </Button>
                </Box>

                <Grid
                  container
                  spacing={4}
                >
                  {/* =========================================
                      COURSE CONTENT
                  ========================================= */}

                  <Grid
                    item
                    xs={12}
                    md={7}
                  >
                    <TextField
                      fullWidth
                      label="Course Eyebrow"
                      value={
                        course.eyebrow ||
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        handleCourseChange(
                          courseIndex,

                          "eyebrow",

                          event
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
                      label="Course Title"
                      value={
                        course.title ||
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        handleCourseChange(
                          courseIndex,

                          "title",

                          event
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
                      minRows={5}
                      label="Description"
                      value={
                        course.description ||
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        handleCourseChange(
                          courseIndex,

                          "description",

                          event
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
                      label="Button Text"
                      value={
                        course.buttonText ||
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        handleCourseChange(
                          courseIndex,

                          "buttonText",

                          event
                            .target
                            .value,
                        )
                      }
                    />
                  </Grid>

                  {/* =========================================
                      COURSE IMAGE
                  ========================================= */}

                  <Grid
                    item
                    xs={12}
                    md={5}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={
                        600
                      }
                      mb={1.5}
                    >
                      Course Image
                    </Typography>

                    <Button
                      variant="outlined"
                      component="label"
                      disabled={
                        uploadingField ===
                        `course.${courseIndex}.image`
                      }
                      sx={{
                        mb: 2,
                      }}
                    >
                      {uploadingField ===
                      `course.${courseIndex}.image`
                        ? "Uploading..."
                        : "Upload Course Image"}

                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(
                          event,
                        ) =>
                          handleImageUpload(
                            event,
                            {
                              type:
                                "course",

                              index:
                                courseIndex,
                            },
                          )
                        }
                      />
                    </Button>

                    <TextField
                      fullWidth
                      label="Image URL"
                      value={
                        course.image ||
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
                        course.imageAlt ||
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        handleCourseChange(
                          courseIndex,

                          "imageAlt",

                          event
                            .target
                            .value,
                        )
                      }
                      sx={{
                        mb: 2,
                      }}
                    />

                    {course.image && (
                      <Box
                        component="img"
                        src={
                          course.image
                        }
                        alt={
                          course.imageAlt ||
                          course.title
                        }
                        sx={{
                          width:
                            "100%",

                          height:
                            280,

                          objectFit:
                            "cover",

                          border:
                            "1px solid",

                          borderColor:
                            "divider",

                          borderRadius:
                            1,
                        }}
                      />
                    )}
                  </Grid>
                </Grid>

                {/* =========================================
                    LEARNING OBJECTIVES
                ========================================= */}

                <Divider
                  sx={{
                    my: 4,
                  }}
                />

                <Box
                  sx={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    gap: 2,

                    mb: 3,

                    flexWrap:
                      "wrap",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={
                        600
                      }
                    >
                      Learning
                      Objectives
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Manage the
                      objectives shown
                      below this course.
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={
                      <Iconify icon="eva:plus-fill" />
                    }
                    onClick={() =>
                      handleAddObjective(
                        courseIndex,
                      )
                    }
                  >
                    Add Objective
                  </Button>
                </Box>

                <Grid
                  container
                  spacing={2}
                >
                  {(
                    course.objectives ||
                    []
                  ).map(
                    (
                      objective,
                      objectiveIndex,
                    ) => (
                      <Grid
                        item
                        xs={12}
                        md={6}
                        key={
                          objectiveIndex
                        }
                      >
                        <Box
                          sx={{
                            display:
                              "flex",

                            alignItems:
                              "flex-start",

                            gap: 1,
                          }}
                        >
                          <TextField
                            fullWidth
                            multiline
                            minRows={
                              2
                            }
                            label={`Objective ${
                              objectiveIndex +
                              1
                            }`}
                            value={
                              objective
                            }
                            onChange={(
                              event,
                            ) =>
                              handleObjectiveChange(
                                courseIndex,

                                objectiveIndex,

                                event
                                  .target
                                  .value,
                              )
                            }
                          />

                          <Button
                            color="error"
                            onClick={() =>
                              handleRemoveObjective(
                                courseIndex,

                                objectiveIndex,
                              )
                            }
                            sx={{
                              minWidth:
                                44,

                              height:
                                44,
                            }}
                          >
                            <Iconify icon="eva:trash-2-fill" />
                          </Button>
                        </Box>
                      </Grid>
                    ),
                  )}
                </Grid>
              </CardContent>
            </Card>
          ),
        )}

        {/* =================================================
            SAVE
        ================================================= */}

        <Box
          sx={{
            display:
              "flex",

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
                170,

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

export default Ceu;