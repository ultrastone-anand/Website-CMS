import PropTypes from "prop-types";
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
  MenuItem,
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
  uploadPagePdf,
  uploadPageImage,
} from "../../../services/pages.service";

const PAGE_SLUG = "silica-first";
const BRAND_RED = "#c91f26";
const BRAND_RED_DARK = "#aa1a20";

const createId = () =>
  `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

const createQuestion = () => ({
  id: createId(),
  question: "",
  answer: "",
});

const createResource = () => ({
  id: createId(),
  organization: "",
  title: "",
  description: "",
  buttonText: "Download PDF",
  url: "",
  pdfName: "",
  type: "download",
});

const createDataSheet = () => ({
  id: createId(),
  name: "",
  category: "",
  description: "",
  englishUrl: "",
  englishPdfName: "",
  spanishUrl: "",
  spanishPdfName: "",
});

const createGuidePoint = () => ({
  id: createId(),
  text: "",
});

const createLabel = () => ({
  id: createId(),
  name: "",
  url: "",
  pdfName: "",
});

const createCertification = () => ({
  id: createId(),
  shortName: "",
  title: "",
  description: "",
});

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const getImageUrl = (response) =>
  response?.data?.secure_url ||
  response?.data?.url ||
  response?.secure_url ||
  response?.url ||
  "";

const getPdfData = (response, file) => {
  const data = response?.data || response;

  return {
    url:
      data?.pdfUrl ||
      data?.url ||
      data?.relativeUrl ||
      "",
    name:
      data?.fileName ||
      data?.originalName ||
      file?.name ||
      "",
  };
};

const normalizeArray = (
  value,
  mapper
) =>
  Array.isArray(value)
    ? value.map(mapper)
    : [];

const getInitialForm = () => ({
  pageHeader: {
    heading: "",
    breadcrumbLabel: "",
    parentBreadcrumbLabel: "",
    parentBreadcrumbLink: "",
  },

  hero: {
    image: "",
    imageAlt: "",
    title: "",
    description: "",
    primaryButtonText: "",
    primaryButtonLink: "",
    secondaryButtonText: "",
    secondaryButtonLink: "",
  },

  aboutSection: {
    eyebrow: "",
    paragraphs: [],
  },

  hazardAwareness: {
    eyebrow: "",
    title: "",
    description: "",
    questions: [],
  },

  resourcesSection: {
    eyebrow: "",
    title: "",
    description: "",
    items: [],
  },

  safetyDataSheetsSection: {
    eyebrow: "",
    title: "",
    description: "",
    searchPlaceholder: "",
    initialVisibleCount: 6,
    items: [],
  },

  guidesSection: {
    image: "",
    imageAlt: "",
    eyebrow: "",
    title: "",
    description: "",
    primaryButtonText: "",
    primaryPdfUrl: "",
    primaryPdfName: "",
    secondaryButtonText: "",
    secondaryPdfUrl: "",
    secondaryPdfName: "",
    points: [],
  },

  labelsSection: {
    eyebrow: "",
    title: "",
    description: "",
    items: [],
  },

  certificationsSection: {
    eyebrow: "",
    title: "",
    description: "",
    footerText: "",
    items: [],
  },

  noticeSection: {
    title: "",
    paragraphs: [],
  },

  contactSection: {
    eyebrow: "",
    title: "",
    description: "",
    phone: "",
    phoneLink: "",
    email: "",
  },
});

const SectionCard = ({
  title,
  action,
  children,
}) => (
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
        <Typography
          variant="h6"
          fontWeight={600}
        >
          {title}
        </Typography>

        {action}
      </Box>

      {children}
    </CardContent>
  </Card>
);

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
};

SectionCard.defaultProps = {
  action: null,
};

const UploadButton = ({
  accept,
  uploading,
  hasFile,
  uploadText,
  replaceText,
  onChange,
  icon,
}) => {
  let buttonLabel = uploadText;

  if (uploading) {
    buttonLabel = "Uploading...";
  } else if (hasFile) {
    buttonLabel = replaceText;
  }

  return (
    <Button
      variant="outlined"
      component="label"
      disabled={uploading}
      startIcon={icon}
    >
      {buttonLabel}

      <input
        hidden
        type="file"
        accept={accept}
        onChange={onChange}
      />
    </Button>
  );
};

UploadButton.propTypes = {
  accept: PropTypes.string.isRequired,
  uploading: PropTypes.bool.isRequired,
  hasFile: PropTypes.bool.isRequired,
  uploadText: PropTypes.string.isRequired,
  replaceText: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  icon: PropTypes.node,
};

UploadButton.defaultProps = {
  icon: null,
};

const PdfControls = ({
  uploading,
  url,
  onUpload,
  onRemove,
  uploadText,
  replaceText,
}) => (
  <Box
    sx={{
      display: "flex",
      gap: 1,
      flexWrap: "wrap",
      alignItems: "center",
    }}
  >
    <UploadButton
      accept="application/pdf,.pdf"
      uploading={uploading}
      hasFile={Boolean(
        url && url !== "#"
      )}
      uploadText={uploadText}
      replaceText={replaceText}
      onChange={onUpload}
      icon={
        <Iconify
          icon="solar:upload-bold"
          width={18}
        />
      }
    />

    {url && url !== "#" && (
      <>
        <Button
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View PDF
        </Button>

        <Button
          color="error"
          onClick={onRemove}
        >
          Remove PDF
        </Button>
      </>
    )}
  </Box>
);

PdfControls.propTypes = {
  uploading: PropTypes.bool.isRequired,
  url: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  uploadText: PropTypes.string,
  replaceText: PropTypes.string,
};

PdfControls.defaultProps = {
  url: "",
  uploadText: "Upload PDF",
  replaceText: "Replace PDF",
};
const SilicaFirst = () => {
  const [pageId, setPageId] =
    useState(null);

  const [form, setForm] = useState(
    getInitialForm
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

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

  const fetchPage =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response =
          await getPageBySlug(
            PAGE_SLUG
          );

        const page =
          response?.data || response;

        if (!page?.id) {
          throw new Error(
            "Silica First page was not found."
          );
        }

        const content =
          page.content || {};

        setPageId(page.id);

        setForm({
          pageHeader: {
            heading:
              content.pageHeader
                ?.heading ||
              "Silica Safety First",

            breadcrumbLabel:
              content.pageHeader
                ?.breadcrumbLabel ||
              "Silica Safety",

            parentBreadcrumbLabel:
              content.pageHeader
                ?.parentBreadcrumbLabel ||
              "Resource Center",

            parentBreadcrumbLink:
              content.pageHeader
                ?.parentBreadcrumbLink ||
              "/resource-center",
          },

          hero: {
            image:
              content.hero?.image ||
              "",

            imageAlt:
              content.hero
                ?.imageAlt || "",

            title:
              content.hero?.title ||
              "",

            description:
              content.hero
                ?.description || "",

            primaryButtonText:
              content.hero
                ?.primaryButtonText ||
              "",

            primaryButtonLink:
              content.hero
                ?.primaryButtonLink ||
              "",

            secondaryButtonText:
              content.hero
                ?.secondaryButtonText ||
              "",

            secondaryButtonLink:
              content.hero
                ?.secondaryButtonLink ||
              "",
          },

          aboutSection: {
            eyebrow:
              content.aboutSection
                ?.eyebrow || "",

            paragraphs:
              Array.isArray(
                content.aboutSection
                  ?.paragraphs
              )
                ? content.aboutSection
                    .paragraphs
                : [],
          },

          hazardAwareness: {
            eyebrow:
              content.hazardAwareness
                ?.eyebrow || "",

            title:
              content.hazardAwareness
                ?.title || "",

            description:
              content.hazardAwareness
                ?.description || "",

            questions:
              normalizeArray(
                content.hazardAwareness
                  ?.questions,
                (item, index) => ({
                  id:
                    item.id ||
                    `${createId()}-${index}`,
                  question:
                    item.question ||
                    "",
                  answer:
                    item.answer || "",
                })
              ),
          },

          resourcesSection: {
            eyebrow:
              content.resourcesSection
                ?.eyebrow || "",

            title:
              content.resourcesSection
                ?.title || "",

            description:
              content.resourcesSection
                ?.description || "",

            items:
              normalizeArray(
                content.resourcesSection
                  ?.items,
                (item, index) => ({
                  id:
                    item.id ||
                    `${createId()}-${index}`,
                  organization:
                    item.organization ||
                    "",
                  title:
                    item.title || "",
                  description:
                    item.description ||
                    "",
                  buttonText:
                    item.buttonText ||
                    "Download PDF",
                  url: item.url || "",
                  pdfName:
                    item.pdfName || "",
                  type:
                    item.type ||
                    "download",
                })
              ),
          },

          safetyDataSheetsSection: {
            eyebrow:
              content
                .safetyDataSheetsSection
                ?.eyebrow || "",

            title:
              content
                .safetyDataSheetsSection
                ?.title || "",

            description:
              content
                .safetyDataSheetsSection
                ?.description || "",

            searchPlaceholder:
              content
                .safetyDataSheetsSection
                ?.searchPlaceholder ||
              "",

            initialVisibleCount:
              Number(
                content
                  .safetyDataSheetsSection
                  ?.initialVisibleCount
              ) || 6,

            items:
              normalizeArray(
                content
                  .safetyDataSheetsSection
                  ?.items,
                (item, index) => ({
                  id:
                    item.id ||
                    `${createId()}-${index}`,
                  name:
                    item.name || "",
                  category:
                    item.category || "",
                  description:
                    item.description ||
                    "",
                  englishUrl:
                    item.englishUrl ||
                    "",
                  englishPdfName:
                    item.englishPdfName ||
                    "",
                  spanishUrl:
                    item.spanishUrl ||
                    "",
                  spanishPdfName:
                    item.spanishPdfName ||
                    "",
                })
              ),
          },

          guidesSection: {
            image:
              content.guidesSection
                ?.image || "",

            imageAlt:
              content.guidesSection
                ?.imageAlt || "",

            eyebrow:
              content.guidesSection
                ?.eyebrow || "",

            title:
              content.guidesSection
                ?.title || "",

            description:
              content.guidesSection
                ?.description || "",

            primaryButtonText:
              content.guidesSection
                ?.primaryButtonText ||
              "",

            primaryPdfUrl:
              content.guidesSection
                ?.primaryPdfUrl || "",

            primaryPdfName:
              content.guidesSection
                ?.primaryPdfName ||
              "",

            secondaryButtonText:
              content.guidesSection
                ?.secondaryButtonText ||
              "",

            secondaryPdfUrl:
              content.guidesSection
                ?.secondaryPdfUrl ||
              "",

            secondaryPdfName:
              content.guidesSection
                ?.secondaryPdfName ||
              "",

            points:
              normalizeArray(
                content.guidesSection
                  ?.points,
                (item, index) => ({
                  id:
                    item.id ||
                    `${createId()}-${index}`,
                  text:
                    typeof item ===
                    "string"
                      ? item
                      : item.text ||
                        "",
                })
              ),
          },

          labelsSection: {
            eyebrow:
              content.labelsSection
                ?.eyebrow || "",

            title:
              content.labelsSection
                ?.title || "",

            description:
              content.labelsSection
                ?.description || "",

            items:
              normalizeArray(
                content.labelsSection
                  ?.items,
                (item, index) => ({
                  id:
                    item.id ||
                    `${createId()}-${index}`,
                  name:
                    item.name || "",
                  url: item.url || "",
                  pdfName:
                    item.pdfName || "",
                })
              ),
          },

          certificationsSection: {
            eyebrow:
              content
                .certificationsSection
                ?.eyebrow || "",

            title:
              content
                .certificationsSection
                ?.title || "",

            description:
              content
                .certificationsSection
                ?.description || "",

            footerText:
              content
                .certificationsSection
                ?.footerText || "",

            items:
              normalizeArray(
                content
                  .certificationsSection
                  ?.items,
                (item, index) => ({
                  id:
                    item.id ||
                    `${createId()}-${index}`,
                  shortName:
                    item.shortName ||
                    "",
                  title:
                    item.title || "",
                  description:
                    item.description ||
                    "",
                })
              ),
          },

          noticeSection: {
            title:
              content.noticeSection
                ?.title || "",

            paragraphs:
              Array.isArray(
                content.noticeSection
                  ?.paragraphs
              )
                ? content.noticeSection
                    .paragraphs
                : [],
          },

          contactSection: {
            eyebrow:
              content.contactSection
                ?.eyebrow || "",

            title:
              content.contactSection
                ?.title || "",

            description:
              content.contactSection
                ?.description || "",

            phone:
              content.contactSection
                ?.phone || "",

            phoneLink:
              content.contactSection
                ?.phoneLink || "",

            email:
              content.contactSection
                ?.email || "",
          },
        });
      } catch (error) {
        console.error(error);

        setErrorMessage(
          getErrorMessage(
            error,
            "Failed to load Silica First page."
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
    setForm((previous) => ({
      ...previous,

      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
  };

  const handleArrayTextChange = (
    section,
    field,
    index,
    value
  ) => {
    setForm((previous) => {
      const updated = [
        ...(previous[section][
          field
        ] || []),
      ];

      updated[index] = value;

      return {
        ...previous,
        [section]: {
          ...previous[section],
          [field]: updated,
        },
      };
    });
  };

  const addArrayText = (
    section,
    field
  ) => {
    setForm((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: [
          ...(previous[section][
            field
          ] || []),
          "",
        ],
      },
    }));
  };

  const removeArrayText = (
    section,
    field,
    index
  ) => {
    setForm((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: previous[
          section
        ][field].filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
      },
    }));
  };

  const handleItemChange = (
    section,
    index,
    field,
    value
  ) => {
    setForm((previous) => {
      const items = [
        ...previous[section].items,
      ];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      return {
        ...previous,
        [section]: {
          ...previous[section],
          items,
        },
      };
    });
  };

  const addItem = (
    section,
    factory
  ) => {
    setForm((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        items: [
          ...previous[section].items,
          factory(),
        ],
      },
    }));
  };

  const removeItem = (
    section,
    index,
    itemLabel
  ) => {
    const shouldRemove =
      window.confirm(
        `Remove "${
          itemLabel ||
          `Item ${index + 1}`
        }"?`
      );

    if (!shouldRemove) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        items: previous[
          section
        ].items.filter(
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
    const file =
      event.target.files?.[0];

    if (!file) return;

    const uploadKey =
      `${section}.${field}`;

    try {
      setUploadingField(
        uploadKey
      );
      setErrorMessage("");
      setSuccessMessage("");

      const response =
        await uploadPageImage(file);

      const imageUrl =
        getImageUrl(response);

      if (!imageUrl) {
        throw new Error(
          "Image URL was not received."
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

  const handleItemPdfUpload =
    async ({
      event,
      section,
      index,
      urlField,
      nameField,
      uploadKey,
    }) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      const isPdf =
        file.type ===
          "application/pdf" ||
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

      try {
        setUploadingField(
          uploadKey
        );
        setErrorMessage("");
        setSuccessMessage("");

        const response =
          await uploadPagePdf(file);

        const pdf =
          getPdfData(
            response,
            file
          );

        if (!pdf.url) {
          throw new Error(
            "PDF URL was not received."
          );
        }

        setForm((previous) => {
          const items = [
            ...previous[section]
              .items,
          ];

          items[index] = {
            ...items[index],
            [urlField]: pdf.url,
            [nameField]:
              pdf.name,
          };

          return {
            ...previous,
            [section]: {
              ...previous[
                section
              ],
              items,
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

  const removeItemPdf = (
    section,
    index,
    urlField,
    nameField
  ) => {
    setForm((previous) => {
      const items = [
        ...previous[section].items,
      ];

      items[index] = {
        ...items[index],
        [urlField]: "",
        [nameField]: "",
      };

      return {
        ...previous,
        [section]: {
          ...previous[section],
          items,
        },
      };
    });
  };

  const handleSectionPdfUpload =
    async (
      event,
      section,
      urlField,
      nameField
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      const isPdf =
        file.type ===
          "application/pdf" ||
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
        `${section}.${urlField}`;

      try {
        setUploadingField(
          uploadKey
        );
        setErrorMessage("");
        setSuccessMessage("");

        const response =
          await uploadPagePdf(file);

        const pdf =
          getPdfData(
            response,
            file
          );

        if (!pdf.url) {
          throw new Error(
            "PDF URL was not received."
          );
        }

        setForm((previous) => ({
          ...previous,
          [section]: {
            ...previous[section],
            [urlField]: pdf.url,
            [nameField]: pdf.name,
          },
        }));
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

  const validateForm = () => {
    if (
      !form.pageHeader.heading.trim()
    ) {
      return "Page heading is required.";
    }

    if (!form.hero.title.trim()) {
      return "Hero title is required.";
    }

    if (
      !form.aboutSection.eyebrow.trim()
    ) {
      return "About section heading is required.";
    }

    for (
      let index = 0;
      index <
      form.hazardAwareness
        .questions.length;
      index += 1
    ) {
      const item =
        form.hazardAwareness
          .questions[index];

      if (!item.question.trim()) {
        return `Question ${
          index + 1
        }: question text is required.`;
      }
    }

    return "";
  };

  const handleSave = async () => {
    const validationError =
      validateForm();

    if (validationError) {
      setErrorMessage(
        validationError
      );
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
          ...form.pageHeader,
          heading:
            form.pageHeader.heading.trim(),
        },

        hero: {
          ...form.hero,
          imageAlt:
            form.hero.imageAlt.trim(),
          title:
            form.hero.title.trim(),
          description:
            form.hero.description.trim(),
          primaryButtonText:
            form.hero.primaryButtonText.trim(),
          primaryButtonLink:
            form.hero.primaryButtonLink.trim(),
          secondaryButtonText:
            form.hero.secondaryButtonText.trim(),
          secondaryButtonLink:
            form.hero.secondaryButtonLink.trim(),
        },

        aboutSection: {
          eyebrow:
            form.aboutSection.eyebrow.trim(),
          paragraphs:
            form.aboutSection.paragraphs
              .map((item) =>
                item.trim()
              )
              .filter(Boolean),
        },

        hazardAwareness: {
          eyebrow:
            form.hazardAwareness.eyebrow.trim(),
          title:
            form.hazardAwareness.title.trim(),
          description:
            form.hazardAwareness.description.trim(),
          questions:
            form.hazardAwareness.questions.map(
              (item, index) => ({
                id: index + 1,
                question:
                  item.question.trim(),
                answer:
                  item.answer.trim(),
              })
            ),
        },

        resourcesSection: {
          eyebrow:
            form.resourcesSection.eyebrow.trim(),
          title:
            form.resourcesSection.title.trim(),
          description:
            form.resourcesSection.description.trim(),
          items:
            form.resourcesSection.items.map(
              (item, index) => ({
                id: index + 1,
                organization:
                  item.organization.trim(),
                title:
                  item.title.trim(),
                description:
                  item.description.trim(),
                buttonText:
                  item.buttonText.trim(),
                url: item.url,
                pdfName:
                  item.pdfName,
                type:
                  item.type,
              })
            ),
        },

        safetyDataSheetsSection: {
          eyebrow:
            form.safetyDataSheetsSection.eyebrow.trim(),
          title:
            form.safetyDataSheetsSection.title.trim(),
          description:
            form.safetyDataSheetsSection.description.trim(),
          searchPlaceholder:
            form.safetyDataSheetsSection.searchPlaceholder.trim(),
          initialVisibleCount:
            Number(
              form.safetyDataSheetsSection.initialVisibleCount
            ) || 6,
          items:
            form.safetyDataSheetsSection.items.map(
              (item, index) => ({
                id: index + 1,
                name:
                  item.name.trim(),
                category:
                  item.category.trim(),
                description:
                  item.description.trim(),
                englishUrl:
                  item.englishUrl,
                englishPdfName:
                  item.englishPdfName,
                spanishUrl:
                  item.spanishUrl,
                spanishPdfName:
                  item.spanishPdfName,
              })
            ),
        },

        guidesSection: {
          ...form.guidesSection,
          imageAlt:
            form.guidesSection.imageAlt.trim(),
          eyebrow:
            form.guidesSection.eyebrow.trim(),
          title:
            form.guidesSection.title.trim(),
          description:
            form.guidesSection.description.trim(),
          primaryButtonText:
            form.guidesSection.primaryButtonText.trim(),
          secondaryButtonText:
            form.guidesSection.secondaryButtonText.trim(),
          points:
            form.guidesSection.points.map(
              (item, index) => ({
                id: index + 1,
                text:
                  item.text.trim(),
              })
            ),
        },

        labelsSection: {
          eyebrow:
            form.labelsSection.eyebrow.trim(),
          title:
            form.labelsSection.title.trim(),
          description:
            form.labelsSection.description.trim(),
          items:
            form.labelsSection.items.map(
              (item, index) => ({
                id: index + 1,
                name:
                  item.name.trim(),
                url: item.url,
                pdfName:
                  item.pdfName,
              })
            ),
        },

        certificationsSection: {
          eyebrow:
            form.certificationsSection.eyebrow.trim(),
          title:
            form.certificationsSection.title.trim(),
          description:
            form.certificationsSection.description.trim(),
          footerText:
            form.certificationsSection.footerText.trim(),
          items:
            form.certificationsSection.items.map(
              (item, index) => ({
                id: index + 1,
                shortName:
                  item.shortName.trim(),
                title:
                  item.title.trim(),
                description:
                  item.description.trim(),
              })
            ),
        },

        noticeSection: {
          title:
            form.noticeSection.title.trim(),
          paragraphs:
            form.noticeSection.paragraphs
              .map((item) =>
                item.trim()
              )
              .filter(Boolean),
        },

        contactSection: {
          eyebrow:
            form.contactSection.eyebrow.trim(),
          title:
            form.contactSection.title.trim(),
          description:
            form.contactSection.description.trim(),
          phone:
            form.contactSection.phone.trim(),
          phoneLink:
            form.contactSection.phoneLink.trim(),
          email:
            form.contactSection.email.trim(),
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
        "Silica First page updated successfully."
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getErrorMessage(
          error,
          "Failed to update Silica First page."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const getSaveButtonLabel = () => {
  if (saving) {
    return "Saving...";
  }

  if (isUploading) {
    return "Upload in Progress...";
  }

  return "Save Changes";
};

  const isUploading =
    Boolean(uploadingField);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "center",
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
          Silica First Page CMS
        </Typography>

        <Box
          sx={{
            width: 70,
            height: 4,
            background: BRAND_RED,
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

        <SectionCard title="Page Header">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Page Heading"
                value={
                  form.pageHeader
                    .heading
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Breadcrumb Label"
                value={
                  form.pageHeader
                    .breadcrumbLabel
                }
                onChange={(event) =>
                  handleChange(
                    "pageHeader",
                    "breadcrumbLabel",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Parent Breadcrumb Label"
                value={
                  form.pageHeader
                    .parentBreadcrumbLabel
                }
                onChange={(event) =>
                  handleChange(
                    "pageHeader",
                    "parentBreadcrumbLabel",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Parent Breadcrumb Link"
                value={
                  form.pageHeader
                    .parentBreadcrumbLink
                }
                onChange={(event) =>
                  handleChange(
                    "pageHeader",
                    "parentBreadcrumbLink",
                    event.target.value
                  )
                }
              />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Hero Section">
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <UploadButton
                accept="image/*"
                uploading={
                  uploadingField ===
                  "hero.image"
                }
                hasFile={Boolean(
                  form.hero.image
                )}
                uploadText="Upload Hero Image"
                replaceText="Replace Hero Image"
                icon={
  <Iconify
    icon="solar:gallery-add-bold"
    width={18}
  />
}
                onChange={(event) =>
                  handleImageUpload(
                    event,
                    "hero",
                    "image"
                  )
                }
              />

              <TextField
                fullWidth
                label="Hero Image URL"
                value={
                  form.hero.image
                }
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mt: 2 }}
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
                sx={{ mt: 2 }}
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
                    height: 320,
                    objectFit: "cover",
                    borderRadius: 1,
                    mt: 2,
                  }}
                />
              )}
            </Grid>

            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                label="Hero Title"
                value={
                  form.hero.title
                }
                onChange={(event) =>
                  handleChange(
                    "hero",
                    "title",
                    event.target.value
                  )
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Hero Description"
                value={
                  form.hero.description
                }
                onChange={(event) =>
                  handleChange(
                    "hero",
                    "description",
                    event.target.value
                  )
                }
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Primary Button Text"
                    value={
                      form.hero
                        .primaryButtonText
                    }
                    onChange={(event) =>
                      handleChange(
                        "hero",
                        "primaryButtonText",
                        event.target.value
                      )
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Primary Button Link"
                    value={
                      form.hero
                        .primaryButtonLink
                    }
                    onChange={(event) =>
                      handleChange(
                        "hero",
                        "primaryButtonLink",
                        event.target.value
                      )
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Secondary Button Text"
                    value={
                      form.hero
                        .secondaryButtonText
                    }
                    onChange={(event) =>
                      handleChange(
                        "hero",
                        "secondaryButtonText",
                        event.target.value
                      )
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Secondary Button Link"
                    value={
                      form.hero
                        .secondaryButtonLink
                    }
                    onChange={(event) =>
                      handleChange(
                        "hero",
                        "secondaryButtonLink",
                        event.target.value
                      )
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard
          title="About This Page"
          action={
            <Button
              variant="outlined"
              startIcon={
  <Iconify
    icon="mingcute:add-line"
    width={18}
  />
}
              onClick={() =>
                addArrayText(
                  "aboutSection",
                  "paragraphs"
                )
              }
            >
              Add Paragraph
            </Button>
          }
        >
          <TextField
            fullWidth
            label="Eyebrow"
            value={
              form.aboutSection
                .eyebrow
            }
            onChange={(event) =>
              handleChange(
                "aboutSection",
                "eyebrow",
                event.target.value
              )
            }
            sx={{ mb: 3 }}
          />

          {form.aboutSection.paragraphs.map(
            (paragraph, index) => (
              <Box
                key={`about-${index}`}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label={`Paragraph ${
                    index + 1
                  }`}
                  value={paragraph}
                  onChange={(event) =>
                    handleArrayTextChange(
                      "aboutSection",
                      "paragraphs",
                      index,
                      event.target.value
                    )
                  }
                />

                <Button
                  color="error"
                  onClick={() =>
                    removeArrayText(
                      "aboutSection",
                      "paragraphs",
                      index
                    )
                  }
                >
                  <Iconify
  icon="solar:trash-bin-trash-bold"
  width={20}
/>
                </Button>
              </Box>
            )
          )}
        </SectionCard>

        <SectionCard
          title="Hazard Awareness"
          action={
            <Button
              variant="contained"
              startIcon={
  <Iconify
    icon="mingcute:add-line"
    width={18}
  />
}
              onClick={() =>
                addItem(
                  "hazardAwareness",
                  createQuestion
                )
              }
              sx={{
                background: BRAND_RED,
                "&:hover": {
                  background:
                    BRAND_RED_DARK,
                },
              }}
            >
              Add Question
            </Button>
          }
        >
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Eyebrow"
                value={
                  form.hazardAwareness
                    .eyebrow
                }
                onChange={(event) =>
                  handleChange(
                    "hazardAwareness",
                    "eyebrow",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Section Title"
                value={
                  form.hazardAwareness
                    .title
                }
                onChange={(event) =>
                  handleChange(
                    "hazardAwareness",
                    "title",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Section Description"
                value={
                  form.hazardAwareness
                    .description
                }
                onChange={(event) =>
                  handleChange(
                    "hazardAwareness",
                    "description",
                    event.target.value
                  )
                }
              />
            </Grid>
          </Grid>

          {form.hazardAwareness.questions.map(
            (item, index) => (
              <Box key={item.id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography fontWeight={600}>
                    Question {index + 1}
                  </Typography>

                  <Button
                    color="error"
                    onClick={() =>
                      removeItem(
                        "hazardAwareness",
                        index,
                        item.question
                      )
                    }
                  >
                    Remove
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  label="Question"
                  value={item.question}
                  onChange={(event) =>
                    handleItemChange(
                      "hazardAwareness",
                      index,
                      "question",
                      event.target.value
                    )
                  }
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Answer"
                  value={item.answer}
                  onChange={(event) =>
                    handleItemChange(
                      "hazardAwareness",
                      index,
                      "answer",
                      event.target.value
                    )
                  }
                />

                {index <
                  form.hazardAwareness
                    .questions.length -
                    1 && (
                  <Divider sx={{ my: 4 }} />
                )}
              </Box>
            )
          )}
        </SectionCard>

        <SectionCard
          title="Safety Resources"
          action={
            <Button
              variant="contained"
              startIcon={
  <Iconify
    icon="mingcute:add-line"
    width={18}
  />
}
              onClick={() =>
                addItem(
                  "resourcesSection",
                  createResource
                )
              }
              sx={{
                background: BRAND_RED,
                "&:hover": {
                  background:
                    BRAND_RED_DARK,
                },
              }}
            >
              Add Resource
            </Button>
          }
        >
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Eyebrow"
                value={
                  form.resourcesSection
                    .eyebrow
                }
                onChange={(event) =>
                  handleChange(
                    "resourcesSection",
                    "eyebrow",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Section Title"
                value={
                  form.resourcesSection
                    .title
                }
                onChange={(event) =>
                  handleChange(
                    "resourcesSection",
                    "title",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Section Description"
                value={
                  form.resourcesSection
                    .description
                }
                onChange={(event) =>
                  handleChange(
                    "resourcesSection",
                    "description",
                    event.target.value
                  )
                }
              />
            </Grid>
          </Grid>

          {form.resourcesSection.items.map(
            (item, index) => {
              const uploadKey =
                `resourcesSection.items.${index}.pdf`;

              return (
                <Box key={item.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography fontWeight={600}>
                      Resource {index + 1}
                    </Typography>

                    <Button
                      color="error"
                      onClick={() =>
                        removeItem(
                          "resourcesSection",
                          index,
                          item.title
                        )
                      }
                    >
                      Remove
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Organization"
                        value={
                          item.organization
                        }
                        onChange={(event) =>
                          handleItemChange(
                            "resourcesSection",
                            index,
                            "organization",
                            event.target.value
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Title"
                        value={item.title}
                        onChange={(event) =>
                          handleItemChange(
                            "resourcesSection",
                            index,
                            "title",
                            event.target.value
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        select
                        fullWidth
                        label="Resource Type"
                        value={item.type}
                        onChange={(event) =>
                          handleItemChange(
                            "resourcesSection",
                            index,
                            "type",
                            event.target.value
                          )
                        }
                      >
                        <MenuItem value="download">
                          PDF Download
                        </MenuItem>
                        <MenuItem value="external">
                          External Link
                        </MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Description"
                        value={
                          item.description
                        }
                        onChange={(event) =>
                          handleItemChange(
                            "resourcesSection",
                            index,
                            "description",
                            event.target.value
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Button Text"
                        value={
                          item.buttonText
                        }
                        onChange={(event) =>
                          handleItemChange(
                            "resourcesSection",
                            index,
                            "buttonText",
                            event.target.value
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={8}>
                      {item.type ===
                      "download" ? (
                        <>
                          <PdfControls
                            uploading={
                              uploadingField ===
                              uploadKey
                            }
                            url={item.url}
                            onUpload={(event) =>
                              handleItemPdfUpload({
                                event,
                                section:
                                  "resourcesSection",
                                index,
                                urlField:
                                  "url",
                                nameField:
                                  "pdfName",
                                uploadKey,
                              })
                            }
                            onRemove={() =>
                              removeItemPdf(
                                "resourcesSection",
                                index,
                                "url",
                                "pdfName"
                              )
                            }
                          />

                          <TextField
                            fullWidth
                            label="Uploaded PDF"
                            value={
                              item.pdfName ||
                              item.url
                            }
                            InputProps={{
                              readOnly: true,
                            }}
                            sx={{ mt: 2 }}
                          />
                        </>
                      ) : (
                        <TextField
                          fullWidth
                          label="External URL"
                          value={item.url}
                          onChange={(event) =>
                            handleItemChange(
                              "resourcesSection",
                              index,
                              "url",
                              event.target.value
                            )
                          }
                        />
                      )}
                    </Grid>
                  </Grid>

                  {index <
                    form.resourcesSection
                      .items.length -
                      1 && (
                    <Divider sx={{ my: 4 }} />
                  )}
                </Box>
              );
            }
          )}
        </SectionCard>

        <SectionCard
          title="Safety Data Sheets"
          action={
            <Button
              variant="contained"
              startIcon={
  <Iconify
    icon="mingcute:add-line"
    width={18}
  />
}
              onClick={() =>
                addItem(
                  "safetyDataSheetsSection",
                  createDataSheet
                )
              }
              sx={{
                background: BRAND_RED,
                "&:hover": {
                  background:
                    BRAND_RED_DARK,
                },
              }}
            >
              Add Data Sheet
            </Button>
          }
        >
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Eyebrow"
                value={
                  form
                    .safetyDataSheetsSection
                    .eyebrow
                }
                onChange={(event) =>
                  handleChange(
                    "safetyDataSheetsSection",
                    "eyebrow",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Section Title"
                value={
                  form
                    .safetyDataSheetsSection
                    .title
                }
                onChange={(event) =>
                  handleChange(
                    "safetyDataSheetsSection",
                    "title",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                value={
                  form
                    .safetyDataSheetsSection
                    .description
                }
                onChange={(event) =>
                  handleChange(
                    "safetyDataSheetsSection",
                    "description",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search Placeholder"
                value={
                  form
                    .safetyDataSheetsSection
                    .searchPlaceholder
                }
                onChange={(event) =>
                  handleChange(
                    "safetyDataSheetsSection",
                    "searchPlaceholder",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Initial Visible Count"
                value={
                  form
                    .safetyDataSheetsSection
                    .initialVisibleCount
                }
                onChange={(event) =>
                  handleChange(
                    "safetyDataSheetsSection",
                    "initialVisibleCount",
                    event.target.value
                  )
                }
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>

          {form.safetyDataSheetsSection.items.map(
            (item, index) => {
              const englishKey =
                `safetyDataSheetsSection.items.${index}.english`;
              const spanishKey =
                `safetyDataSheetsSection.items.${index}.spanish`;

              return (
                <Box key={item.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography fontWeight={600}>
                      Data Sheet {index + 1}
                    </Typography>

                    <Button
                      color="error"
                      onClick={() =>
                        removeItem(
                          "safetyDataSheetsSection",
                          index,
                          item.name
                        )
                      }
                    >
                      Remove
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Material Name"
                        value={item.name}
                        onChange={(event) =>
                          handleItemChange(
                            "safetyDataSheetsSection",
                            index,
                            "name",
                            event.target.value
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Category"
                        value={
                          item.category
                        }
                        onChange={(event) =>
                          handleItemChange(
                            "safetyDataSheetsSection",
                            index,
                            "category",
                            event.target.value
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Description"
                        value={
                          item.description
                        }
                        onChange={(event) =>
                          handleItemChange(
                            "safetyDataSheetsSection",
                            index,
                            "description",
                            event.target.value
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        mb={1.5}
                      >
                        English PDF
                      </Typography>

                      <PdfControls
                        uploading={
                          uploadingField ===
                          englishKey
                        }
                        url={
                          item.englishUrl
                        }
                        onUpload={(event) =>
                          handleItemPdfUpload({
                            event,
                            section:
                              "safetyDataSheetsSection",
                            index,
                            urlField:
                              "englishUrl",
                            nameField:
                              "englishPdfName",
                            uploadKey:
                              englishKey,
                          })
                        }
                        onRemove={() =>
                          removeItemPdf(
                            "safetyDataSheetsSection",
                            index,
                            "englishUrl",
                            "englishPdfName"
                          )
                        }
                      />

                      <TextField
                        fullWidth
                        label="English PDF"
                        value={
                          item.englishPdfName ||
                          item.englishUrl
                        }
                        InputProps={{
                          readOnly: true,
                        }}
                        sx={{ mt: 2 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        mb={1.5}
                      >
                        Spanish PDF
                      </Typography>

                      <PdfControls
                        uploading={
                          uploadingField ===
                          spanishKey
                        }
                        url={
                          item.spanishUrl
                        }
                        onUpload={(event) =>
                          handleItemPdfUpload({
                            event,
                            section:
                              "safetyDataSheetsSection",
                            index,
                            urlField:
                              "spanishUrl",
                            nameField:
                              "spanishPdfName",
                            uploadKey:
                              spanishKey,
                          })
                        }
                        onRemove={() =>
                          removeItemPdf(
                            "safetyDataSheetsSection",
                            index,
                            "spanishUrl",
                            "spanishPdfName"
                          )
                        }
                      />

                      <TextField
                        fullWidth
                        label="Spanish PDF"
                        value={
                          item.spanishPdfName ||
                          item.spanishUrl
                        }
                        InputProps={{
                          readOnly: true,
                        }}
                        sx={{ mt: 2 }}
                      />
                    </Grid>
                  </Grid>

                  {index <
                    form
                      .safetyDataSheetsSection
                      .items.length -
                      1 && (
                    <Divider sx={{ my: 4 }} />
                  )}
                </Box>
              );
            }
          )}
        </SectionCard>

        <SectionCard
          title="Best Practice Guides"
          action={
            <Button
              variant="outlined"
              startIcon={
  <Iconify
    icon="mingcute:add-line"
    width={18}
  />
}
              onClick={() =>
                setForm((previous) => ({
                  ...previous,
                  guidesSection: {
                    ...previous.guidesSection,
                    points: [
                      ...previous.guidesSection.points,
                      createGuidePoint(),
                    ],
                  },
                }))
              }
            >
              Add Guide Point
            </Button>
          }
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <UploadButton
                accept="image/*"
                uploading={
                  uploadingField ===
                  "guidesSection.image"
                }
                hasFile={Boolean(
                  form.guidesSection
                    .image
                )}
                uploadText="Upload Guide Image"
                replaceText="Replace Guide Image"
                icon={
  <Iconify
    icon="solar:gallery-add-bold"
    width={18}
  />
}
                onChange={(event) =>
                  handleImageUpload(
                    event,
                    "guidesSection",
                    "image"
                  )
                }
              />

              <TextField
                fullWidth
                label="Guide Image URL"
                value={
                  form.guidesSection
                    .image
                }
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mt: 2 }}
              />

              <TextField
                fullWidth
                label="Guide Image Alt Text"
                value={
                  form.guidesSection
                    .imageAlt
                }
                onChange={(event) =>
                  handleChange(
                    "guidesSection",
                    "imageAlt",
                    event.target.value
                  )
                }
                sx={{ mt: 2 }}
              />

              {form.guidesSection
                .image && (
                <Box
                  component="img"
                  src={
                    form.guidesSection
                      .image
                  }
                  alt={
                    form.guidesSection
                      .imageAlt ||
                    "Guide preview"
                  }
                  sx={{
                    width: "100%",
                    height: 280,
                    objectFit: "cover",
                    borderRadius: 1,
                    mt: 2,
                  }}
                />
              )}
            </Grid>

            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                label="Eyebrow"
                value={
                  form.guidesSection
                    .eyebrow
                }
                onChange={(event) =>
                  handleChange(
                    "guidesSection",
                    "eyebrow",
                    event.target.value
                  )
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Section Title"
                value={
                  form.guidesSection
                    .title
                }
                onChange={(event) =>
                  handleChange(
                    "guidesSection",
                    "title",
                    event.target.value
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
                  form.guidesSection
                    .description
                }
                onChange={(event) =>
                  handleChange(
                    "guidesSection",
                    "description",
                    event.target.value
                  )
                }
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Primary Button Text"
                value={
                  form.guidesSection
                    .primaryButtonText
                }
                onChange={(event) =>
                  handleChange(
                    "guidesSection",
                    "primaryButtonText",
                    event.target.value
                  )
                }
                sx={{ mb: 2 }}
              />

              <PdfControls
                uploading={
                  uploadingField ===
                  "guidesSection.primaryPdfUrl"
                }
                url={
                  form.guidesSection
                    .primaryPdfUrl
                }
                onUpload={(event) =>
                  handleSectionPdfUpload(
                    event,
                    "guidesSection",
                    "primaryPdfUrl",
                    "primaryPdfName"
                  )
                }
                onRemove={() => {
                  handleChange(
                    "guidesSection",
                    "primaryPdfUrl",
                    ""
                  );
                  handleChange(
                    "guidesSection",
                    "primaryPdfName",
                    ""
                  );
                }}
              />

              <TextField
                fullWidth
                label="Primary PDF"
                value={
                  form.guidesSection
                    .primaryPdfName ||
                  form.guidesSection
                    .primaryPdfUrl
                }
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mt: 2, mb: 3 }}
              />

              <TextField
                fullWidth
                label="Secondary Button Text"
                value={
                  form.guidesSection
                    .secondaryButtonText
                }
                onChange={(event) =>
                  handleChange(
                    "guidesSection",
                    "secondaryButtonText",
                    event.target.value
                  )
                }
                sx={{ mb: 2 }}
              />

              <PdfControls
                uploading={
                  uploadingField ===
                  "guidesSection.secondaryPdfUrl"
                }
                url={
                  form.guidesSection
                    .secondaryPdfUrl
                }
                onUpload={(event) =>
                  handleSectionPdfUpload(
                    event,
                    "guidesSection",
                    "secondaryPdfUrl",
                    "secondaryPdfName"
                  )
                }
                onRemove={() => {
                  handleChange(
                    "guidesSection",
                    "secondaryPdfUrl",
                    ""
                  );
                  handleChange(
                    "guidesSection",
                    "secondaryPdfName",
                    ""
                  );
                }}
              />

              <TextField
                fullWidth
                label="Secondary PDF"
                value={
                  form.guidesSection
                    .secondaryPdfName ||
                  form.guidesSection
                    .secondaryPdfUrl
                }
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {form.guidesSection.points.map(
            (item, index) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  gap: 1,
                  mb: 2,
                }}
              >
                <TextField
                  fullWidth
                  label={`Guide Point ${
                    index + 1
                  }`}
                  value={item.text}
                  onChange={(event) => {
                    setForm(
                      (previous) => {
                        const points = [
                          ...previous
                            .guidesSection
                            .points,
                        ];

                        points[index] = {
                          ...points[index],
                          text:
                            event.target
                              .value,
                        };

                        return {
                          ...previous,
                          guidesSection: {
                            ...previous.guidesSection,
                            points,
                          },
                        };
                      }
                    );
                  }}
                />

                <Button
                  color="error"
                  onClick={() =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        guidesSection: {
                          ...previous.guidesSection,
                          points:
                            previous.guidesSection.points.filter(
                              (
                                _,
                                itemIndex
                              ) =>
                                itemIndex !==
                                index
                            ),
                        },
                      })
                    )
                  }
                >
                  <Iconify
  icon="solar:trash-bin-trash-bold"
  width={20}
/>
                </Button>
              </Box>
            )
          )}
        </SectionCard>

        <SectionCard
          title="Safety Labels"
          action={
            <Button
              variant="contained"
              startIcon={
  <Iconify
    icon="mingcute:add-line"
    width={18}
  />
}
              onClick={() =>
                addItem(
                  "labelsSection",
                  createLabel
                )
              }
              sx={{
                background: BRAND_RED,
                "&:hover": {
                  background:
                    BRAND_RED_DARK,
                },
              }}
            >
              Add Label
            </Button>
          }
        >
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Eyebrow"
                value={
                  form.labelsSection
                    .eyebrow
                }
                onChange={(event) =>
                  handleChange(
                    "labelsSection",
                    "eyebrow",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Section Title"
                value={
                  form.labelsSection
                    .title
                }
                onChange={(event) =>
                  handleChange(
                    "labelsSection",
                    "title",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                value={
                  form.labelsSection
                    .description
                }
                onChange={(event) =>
                  handleChange(
                    "labelsSection",
                    "description",
                    event.target.value
                  )
                }
              />
            </Grid>
          </Grid>

          {form.labelsSection.items.map(
            (item, index) => {
              const uploadKey =
                `labelsSection.items.${index}.pdf`;

              return (
                <Box key={item.id}>
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                  >
                    <Grid
                      item
                      xs={12}
                      md={4}
                    >
                      <TextField
                        fullWidth
                        label="Label Name"
                        value={item.name}
                        onChange={(event) =>
                          handleItemChange(
                            "labelsSection",
                            index,
                            "name",
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
                      <PdfControls
                        uploading={
                          uploadingField ===
                          uploadKey
                        }
                        url={item.url}
                        onUpload={(event) =>
                          handleItemPdfUpload({
                            event,
                            section:
                              "labelsSection",
                            index,
                            urlField:
                              "url",
                            nameField:
                              "pdfName",
                            uploadKey,
                          })
                        }
                        onRemove={() =>
                          removeItemPdf(
                            "labelsSection",
                            index,
                            "url",
                            "pdfName"
                          )
                        }
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={2}
                    >
                      <Button
                        fullWidth
                        color="error"
                        onClick={() =>
                          removeItem(
                            "labelsSection",
                            index,
                            item.name
                          )
                        }
                      >
                        Remove
                      </Button>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Uploaded PDF"
                        value={
                          item.pdfName ||
                          item.url
                        }
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                  </Grid>

                  {index <
                    form.labelsSection
                      .items.length -
                      1 && (
                    <Divider sx={{ my: 3 }} />
                  )}
                </Box>
              );
            }
          )}
        </SectionCard>

        <SectionCard
          title="Certifications"
          action={
            <Button
              variant="contained"
              startIcon={
  <Iconify
    icon="mingcute:add-line"
    width={18}
  />
}
              onClick={() =>
                addItem(
                  "certificationsSection",
                  createCertification
                )
              }
              sx={{
                background: BRAND_RED,
                "&:hover": {
                  background:
                    BRAND_RED_DARK,
                },
              }}
            >
              Add Certification
            </Button>
          }
        >
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Eyebrow"
                value={
                  form
                    .certificationsSection
                    .eyebrow
                }
                onChange={(event) =>
                  handleChange(
                    "certificationsSection",
                    "eyebrow",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Section Title"
                value={
                  form
                    .certificationsSection
                    .title
                }
                onChange={(event) =>
                  handleChange(
                    "certificationsSection",
                    "title",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                value={
                  form
                    .certificationsSection
                    .description
                }
                onChange={(event) =>
                  handleChange(
                    "certificationsSection",
                    "description",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Footer Text"
                value={
                  form
                    .certificationsSection
                    .footerText
                }
                onChange={(event) =>
                  handleChange(
                    "certificationsSection",
                    "footerText",
                    event.target.value
                  )
                }
              />
            </Grid>
          </Grid>

          {form.certificationsSection.items.map(
            (item, index) => (
              <Box key={item.id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography fontWeight={600}>
                    Certification {index + 1}
                  </Typography>

                  <Button
                    color="error"
                    onClick={() =>
                      removeItem(
                        "certificationsSection",
                        index,
                        item.title
                      )
                    }
                  >
                    Remove
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Short Name"
                      value={
                        item.shortName
                      }
                      onChange={(event) =>
                        handleItemChange(
                          "certificationsSection",
                          index,
                          "shortName",
                          event.target.value
                        )
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={item.title}
                      onChange={(event) =>
                        handleItemChange(
                          "certificationsSection",
                          index,
                          "title",
                          event.target.value
                        )
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Description"
                      value={
                        item.description
                      }
                      onChange={(event) =>
                        handleItemChange(
                          "certificationsSection",
                          index,
                          "description",
                          event.target.value
                        )
                      }
                    />
                  </Grid>
                </Grid>

                {index <
                  form.certificationsSection
                    .items.length -
                    1 && (
                  <Divider sx={{ my: 3 }} />
                )}
              </Box>
            )
          )}
        </SectionCard>

        <SectionCard
          title="Safety & Compliance Notice"
          action={
            <Button
              variant="outlined"
              startIcon={
  <Iconify
    icon="mingcute:add-line"
    width={18}
  />
}
              onClick={() =>
                addArrayText(
                  "noticeSection",
                  "paragraphs"
                )
              }
            >
              Add Paragraph
            </Button>
          }
        >
          <TextField
            fullWidth
            label="Notice Title"
            value={
              form.noticeSection
                .title
            }
            onChange={(event) =>
              handleChange(
                "noticeSection",
                "title",
                event.target.value
              )
            }
            sx={{ mb: 3 }}
          />

          {form.noticeSection.paragraphs.map(
            (paragraph, index) => (
              <Box
                key={`notice-${index}`}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label={`Paragraph ${
                    index + 1
                  }`}
                  value={paragraph}
                  onChange={(event) =>
                    handleArrayTextChange(
                      "noticeSection",
                      "paragraphs",
                      index,
                      event.target.value
                    )
                  }
                />

                <Button
                  color="error"
                  onClick={() =>
                    removeArrayText(
                      "noticeSection",
                      "paragraphs",
                      index
                    )
                  }
                >
                  <Iconify
  icon="solar:trash-bin-trash-bold"
  width={20}
/>
                </Button>
              </Box>
            )
          )}
        </SectionCard>

        <SectionCard title="Contact CTA">
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Eyebrow"
                value={
                  form.contactSection
                    .eyebrow
                }
                onChange={(event) =>
                  handleChange(
                    "contactSection",
                    "eyebrow",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="CTA Title"
                value={
                  form.contactSection
                    .title
                }
                onChange={(event) =>
                  handleChange(
                    "contactSection",
                    "title",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="CTA Description"
                value={
                  form.contactSection
                    .description
                }
                onChange={(event) =>
                  handleChange(
                    "contactSection",
                    "description",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone Display Text"
                value={
                  form.contactSection
                    .phone
                }
                onChange={(event) =>
                  handleChange(
                    "contactSection",
                    "phone",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone Link Value"
                value={
                  form.contactSection
                    .phoneLink
                }
                onChange={(event) =>
                  handleChange(
                    "contactSection",
                    "phoneLink",
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={
                  form.contactSection
                    .email
                }
                onChange={(event) =>
                  handleChange(
                    "contactSection",
                    "email",
                    event.target.value
                  )
                }
              />
            </Grid>
          </Grid>
        </SectionCard>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            saving ||
            isUploading ||
            !pageId
          }
          sx={{
            background: BRAND_RED,
            px: 5,
            py: 1.4,
            mb: 5,
            "&:hover": {
              background:
                BRAND_RED_DARK,
            },
          }}
        >
{getSaveButtonLabel()}
        </Button>
      </Container>
    </Box>
  );
};

export default SilicaFirst;
