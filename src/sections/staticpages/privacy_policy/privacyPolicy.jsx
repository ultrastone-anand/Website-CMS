import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";

import {
  Box,
  Card,
  Grid,
  Button,
  Switch,
  Divider,
  MenuItem,
  Container,
  TextField,
  Typography,
  CardContent,
  CircularProgress,
  FormControlLabel,
} from "@mui/material";

import {
  updatePage,
  getPageBySlug,
} from "../../../services/pages.service";

// ----------------------------------------------------------------------

const BLOCK_TYPES = [
  {
    value: "paragraph",
    label: "Paragraph",
  },
  {
    value: "subheading",
    label: "Subheading",
  },
  {
    value: "minorHeading",
    label: "Minor Heading",
  },
  {
    value: "bulletList",
    label: "Bullet List",
  },
  {
    value: "definitions",
    label: "Definition List",
  },
  {
    value: "cookieCards",
    label: "Cookie Cards",
  },
  {
    value: "notice",
    label: "Highlighted Notice",
  },
  {
    value: "contactList",
    label: "Contact List",
  },
];

const CONTACT_TYPES = [
  {
    value: "text",
    label: "Plain Text",
  },
  {
    value: "email",
    label: "Email",
  },
  {
    value: "phone",
    label: "Phone",
  },
  {
    value: "url",
    label: "Website URL",
  },
];

// ----------------------------------------------------------------------

const blockItemShape = PropTypes.shape({
  id: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  cookieType: PropTypes.string,
  administeredBy: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  type: PropTypes.string,
});

const blockShape = PropTypes.shape({
  id: PropTypes.string,
  type: PropTypes.string.isRequired,
  text: PropTypes.string,
  items: PropTypes.arrayOf(blockItemShape),
});

// ----------------------------------------------------------------------

const createId = (prefix = "item") => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

const cloneValue = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const createSection = () => ({
  id: createId("section"),
  anchor: "",
  navigationLabel: "",
  title: "",
  showInNavigation: true,
  showDivider: true,
  blocks: [],
});

const createBlock = (type = "paragraph") => {
  const baseBlock = {
    id: createId("block"),
    type,
  };

  switch (type) {
    case "paragraph":
    case "subheading":
    case "minorHeading":
    case "notice":
      return {
        ...baseBlock,
        text: "",
      };

    case "bulletList":
      return {
        ...baseBlock,
        items: [
          {
            id: createId("bullet"),
            text: "",
          },
        ],
      };

    case "definitions":
      return {
        ...baseBlock,
        items: [
          {
            id: createId("definition"),
            title: "",
            description: "",
          },
        ],
      };

    case "cookieCards":
      return {
        ...baseBlock,
        items: [
          {
            id: createId("cookie"),
            title: "",
            cookieType: "",
            administeredBy: "",
            description: "",
          },
        ],
      };

    case "contactList":
      return {
        ...baseBlock,
        items: [
          {
            id: createId("contact"),
            label: "",
            value: "",
            type: "text",
          },
        ],
      };

    default:
      return {
        ...baseBlock,
        text: "",
      };
  }
};

const createBlockItem = (blockType) => {
  switch (blockType) {
    case "bulletList":
      return {
        id: createId("bullet"),
        text: "",
      };

    case "definitions":
      return {
        id: createId("definition"),
        title: "",
        description: "",
      };

    case "cookieCards":
      return {
        id: createId("cookie"),
        title: "",
        cookieType: "",
        administeredBy: "",
        description: "",
      };

    case "contactList":
      return {
        id: createId("contact"),
        label: "",
        value: "",
        type: "text",
      };

    default:
      return null;
  }
};

const normalizeBlock = (block) => ({
  ...block,
  id: block.id || createId("block"),
  items: Array.isArray(block.items)
    ? block.items.map((item) => ({
        ...item,
        id: item.id || createId("item"),
      }))
    : block.items,
});

const normalizeSection = (section) => ({
  ...section,
  id: section.id || createId("section"),
  anchor: section.anchor || "",
  navigationLabel: section.navigationLabel || "",
  title: section.title || "",
  showInNavigation: section.showInNavigation !== false,
  showDivider: section.showDivider !== false,
  blocks: Array.isArray(section.blocks)
    ? section.blocks.map(normalizeBlock)
    : [],
});

// ----------------------------------------------------------------------

const PrivacyPolicyCMS = () => {
  const [pageId, setPageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    pageHeader: {
      heading: "",
      breadcrumbLabel: "",
    },
    sections: [],
  });

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      setLoading(true);

      const response = await getPageBySlug("privacy-policy");
      const page = response.data || response;

      if (!page?.id) {
        throw new Error("Privacy Policy page was not found.");
      }

      setPageId(page.id);

      setForm({
        pageHeader: {
          heading:
            page.content?.pageHeader?.heading ||
            page.title ||
            "Privacy Policy",

          breadcrumbLabel:
            page.content?.pageHeader?.breadcrumbLabel ||
            page.content?.pageHeader?.heading ||
            page.title ||
            "Privacy Policy",
        },

        sections: Array.isArray(page.content?.sections)
          ? page.content.sections.map(normalizeSection)
          : [],
      });
    } catch (error) {
      console.error("Error fetching Privacy Policy page:", error);

      alert(
        error?.response?.data?.message ||
          error.message ||
          "Unable to load Privacy Policy page."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------
  // PAGE HEADER
  // --------------------------------------------------------------------

  const handleHeaderChange = (field, value) => {
    setForm((previousForm) => ({
      ...previousForm,
      pageHeader: {
        ...previousForm.pageHeader,
        [field]: value,
      },
    }));
  };

  // --------------------------------------------------------------------
  // SECTIONS
  // --------------------------------------------------------------------

  const handleAddSection = () => {
    setForm((previousForm) => ({
      ...previousForm,
      sections: [...previousForm.sections, createSection()],
    }));
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    setForm((previousForm) => {
      const updatedSections = [...previousForm.sections];

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        [field]: value,
      };

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  const handleDeleteSection = (sectionIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this entire section?"
    );

    if (!confirmed) {
      return;
    }

    setForm((previousForm) => ({
      ...previousForm,
      sections: previousForm.sections.filter(
        (_, index) => index !== sectionIndex
      ),
    }));
  };

  const handleDuplicateSection = (sectionIndex) => {
    setForm((previousForm) => {
      const sourceSection = previousForm.sections[sectionIndex];
      const clonedSection = cloneValue(sourceSection);

      const duplicatedSection = {
        ...clonedSection,
        id: createId("section"),
        anchor: sourceSection.anchor
          ? `${sourceSection.anchor}-copy`
          : "",
        navigationLabel: sourceSection.navigationLabel
          ? `${sourceSection.navigationLabel} Copy`
          : "",
        blocks: (clonedSection.blocks || []).map((block) => ({
          ...block,
          id: createId("block"),
          items: Array.isArray(block.items)
            ? block.items.map((item) => ({
                ...item,
                id: createId("item"),
              }))
            : block.items,
        })),
      };

      const updatedSections = [...previousForm.sections];

      updatedSections.splice(
        sectionIndex + 1,
        0,
        duplicatedSection
      );

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  const handleMoveSection = (sectionIndex, direction) => {
    setForm((previousForm) => {
      const targetIndex =
        direction === "up"
          ? sectionIndex - 1
          : sectionIndex + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= previousForm.sections.length
      ) {
        return previousForm;
      }

      const updatedSections = [...previousForm.sections];

      const currentSection = updatedSections[sectionIndex];

      updatedSections[sectionIndex] =
        updatedSections[targetIndex];

      updatedSections[targetIndex] = currentSection;

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  // --------------------------------------------------------------------
  // BLOCKS
  // --------------------------------------------------------------------

  const handleAddBlock = (sectionIndex, blockType) => {
    if (!blockType) {
      return;
    }

    setForm((previousForm) => {
      const updatedSections = [...previousForm.sections];
      const currentSection = updatedSections[sectionIndex];

      updatedSections[sectionIndex] = {
        ...currentSection,
        blocks: [
          ...(currentSection.blocks || []),
          createBlock(blockType),
        ],
      };

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  const handleBlockChange = (
    sectionIndex,
    blockIndex,
    field,
    value
  ) => {
    setForm((previousForm) => {
      const updatedSections = [...previousForm.sections];

      const updatedBlocks = [
        ...(updatedSections[sectionIndex].blocks || []),
      ];

      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        [field]: value,
      };

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        blocks: updatedBlocks,
      };

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  const handleDeleteBlock = (sectionIndex, blockIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this content block?"
    );

    if (!confirmed) {
      return;
    }

    setForm((previousForm) => {
      const updatedSections = [...previousForm.sections];

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        blocks: (
          updatedSections[sectionIndex].blocks || []
        ).filter((_, index) => index !== blockIndex),
      };

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  const handleDuplicateBlock = (
    sectionIndex,
    blockIndex
  ) => {
    setForm((previousForm) => {
      const updatedSections = [...previousForm.sections];

      const updatedBlocks = [
        ...(updatedSections[sectionIndex].blocks || []),
      ];

      const sourceBlock = updatedBlocks[blockIndex];
      const clonedBlock = cloneValue(sourceBlock);

      const duplicatedBlock = {
        ...clonedBlock,
        id: createId("block"),
        items: Array.isArray(clonedBlock.items)
          ? clonedBlock.items.map((item) => ({
              ...item,
              id: createId("item"),
            }))
          : clonedBlock.items,
      };

      updatedBlocks.splice(
        blockIndex + 1,
        0,
        duplicatedBlock
      );

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        blocks: updatedBlocks,
      };

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  const handleMoveBlock = (
    sectionIndex,
    blockIndex,
    direction
  ) => {
    setForm((previousForm) => {
      const updatedSections = [...previousForm.sections];

      const updatedBlocks = [
        ...(updatedSections[sectionIndex].blocks || []),
      ];

      const targetIndex =
        direction === "up"
          ? blockIndex - 1
          : blockIndex + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= updatedBlocks.length
      ) {
        return previousForm;
      }

      const currentBlock = updatedBlocks[blockIndex];

      updatedBlocks[blockIndex] =
        updatedBlocks[targetIndex];

      updatedBlocks[targetIndex] = currentBlock;

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        blocks: updatedBlocks,
      };

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  // --------------------------------------------------------------------
  // REPEATABLE BLOCK ITEMS
  // --------------------------------------------------------------------

  const handleBlockItemChange = (
    sectionIndex,
    blockIndex,
    itemIndex,
    field,
    value
  ) => {
    setForm((previousForm) => {
      const updatedSections = [...previousForm.sections];

      const updatedBlocks = [
        ...(updatedSections[sectionIndex].blocks || []),
      ];

      const updatedItems = [
        ...(updatedBlocks[blockIndex].items || []),
      ];

      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        [field]: value,
      };

      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        items: updatedItems,
      };

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        blocks: updatedBlocks,
      };

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  const handleAddBlockItem = (
    sectionIndex,
    blockIndex,
    blockType
  ) => {
    const newItem = createBlockItem(blockType);

    if (!newItem) {
      return;
    }

    setForm((previousForm) => {
      const updatedSections = [...previousForm.sections];

      const updatedBlocks = [
        ...(updatedSections[sectionIndex].blocks || []),
      ];

      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        items: [
          ...(updatedBlocks[blockIndex].items || []),
          newItem,
        ],
      };

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        blocks: updatedBlocks,
      };

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  const handleDeleteBlockItem = (
    sectionIndex,
    blockIndex,
    itemIndex
  ) => {
    setForm((previousForm) => {
      const updatedSections = [...previousForm.sections];

      const updatedBlocks = [
        ...(updatedSections[sectionIndex].blocks || []),
      ];

      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        items: (
          updatedBlocks[blockIndex].items || []
        ).filter((_, index) => index !== itemIndex),
      };

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        blocks: updatedBlocks,
      };

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  const handleMoveBlockItem = (
    sectionIndex,
    blockIndex,
    itemIndex,
    direction
  ) => {
    setForm((previousForm) => {
      const updatedSections = [...previousForm.sections];

      const updatedBlocks = [
        ...(updatedSections[sectionIndex].blocks || []),
      ];

      const updatedItems = [
        ...(updatedBlocks[blockIndex].items || []),
      ];

      const targetIndex =
        direction === "up"
          ? itemIndex - 1
          : itemIndex + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= updatedItems.length
      ) {
        return previousForm;
      }

      const currentItem = updatedItems[itemIndex];

      updatedItems[itemIndex] =
        updatedItems[targetIndex];

      updatedItems[targetIndex] = currentItem;

      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        items: updatedItems,
      };

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        blocks: updatedBlocks,
      };

      return {
        ...previousForm,
        sections: updatedSections,
      };
    });
  };

  // --------------------------------------------------------------------
  // VALIDATION
  // --------------------------------------------------------------------

  const validateForm = () => {
    if (!form.pageHeader.heading.trim()) {
      throw new Error("Page heading is required.");
    }

    const usedAnchors = new Set();

    form.sections.forEach((section, index) => {
      if (!section.anchor?.trim()) {
        throw new Error(
          `Section ${index + 1} requires an anchor.`
        );
      }

      if (usedAnchors.has(section.anchor)) {
        throw new Error(
          `Duplicate section anchor found: ${section.anchor}`
        );
      }

      usedAnchors.add(section.anchor);
    });
  };

  // --------------------------------------------------------------------
  // SAVE
  // --------------------------------------------------------------------

  const handleSave = async () => {
    if (!pageId) {
      alert("Privacy Policy page ID was not found.");
      return;
    }

    try {
      validateForm();

      setSaving(true);

      await updatePage(pageId, {
        title:
          form.pageHeader.heading.trim() ||
          "Privacy Policy",

        status: "published",

        content: form,
      });

      alert("Privacy Policy page updated successfully.");
    } catch (error) {
      console.error("Error saving Privacy Policy:", error);

      alert(
        error?.response?.data?.message ||
          error.message ||
          "Unable to save Privacy Policy page."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------------------

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
          Privacy Policy CMS
        </Typography>

        <Box
          sx={{
            width: 70,
            height: 4,
            backgroundColor: "#c91f26",
            mb: 4,
          }}
        />

        {/* PAGE HEADER */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" mb={3}>
              Page Header
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Page Heading"
                  value={form.pageHeader.heading}
                  onChange={(event) =>
                    handleHeaderChange(
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
                    form.pageHeader.breadcrumbLabel
                  }
                  onChange={(event) =>
                    handleHeaderChange(
                      "breadcrumbLabel",
                      event.target.value
                    )
                  }
                />
              </Grid>
            </Grid>

            <Typography
              sx={{
                mt: 2,
                color: "text.secondary",
                fontSize: 13,
              }}
            >
              The Last Updated date is generated automatically
              using the page updated_at value.
            </Typography>
          </CardContent>
        </Card>

        {/* SECTION HEADER */}
        <Box
          sx={{
            display: "flex",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            justifyContent: "space-between",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Content Sections
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Add, remove, duplicate and reorder sections and
              content blocks.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={handleAddSection}
            sx={{
              backgroundColor: "#c91f26",
              "&:hover": {
                backgroundColor: "#aa1a20",
              },
            }}
          >
            Add Section
          </Button>
        </Box>

        {form.sections.length === 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent
              sx={{
                textAlign: "center",
                py: 8,
              }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                mb={2}
              >
                No content sections found
              </Typography>

              <Button
                variant="outlined"
                onClick={handleAddSection}
              >
                Create First Section
              </Button>
            </CardContent>
          </Card>
        )}

        {form.sections.map(
          (section, sectionIndex) => (
            <Card
              key={section.id || sectionIndex}
              sx={{
                mb: 4,
                borderTop: "4px solid #c91f26",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: {
                      xs: "column",
                      md: "row",
                    },
                    alignItems: {
                      xs: "flex-start",
                      md: "center",
                    },
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={600}
                  >
                    Section {sectionIndex + 1}
                    {section.title
                      ? ` — ${section.title}`
                      : ""}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={sectionIndex === 0}
                      onClick={() =>
                        handleMoveSection(
                          sectionIndex,
                          "up"
                        )
                      }
                    >
                      Move Up
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      disabled={
                        sectionIndex ===
                        form.sections.length - 1
                      }
                      onClick={() =>
                        handleMoveSection(
                          sectionIndex,
                          "down"
                        )
                      }
                    >
                      Move Down
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        handleDuplicateSection(
                          sectionIndex
                        )
                      }
                    >
                      Duplicate
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() =>
                        handleDeleteSection(
                          sectionIndex
                        )
                      }
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Section Title"
                      value={section.title || ""}
                      onChange={(event) =>
                        handleSectionChange(
                          sectionIndex,
                          "title",
                          event.target.value
                        )
                      }
                      helperText="Leave empty when the section should not display a title."
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Navigation Label"
                      value={
                        section.navigationLabel || ""
                      }
                      onChange={(event) =>
                        handleSectionChange(
                          sectionIndex,
                          "navigationLabel",
                          event.target.value
                        )
                      }
                      helperText="Text displayed in the page navigation."
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Section Anchor"
                      value={section.anchor || ""}
                      onChange={(event) =>
                        handleSectionChange(
                          sectionIndex,
                          "anchor",
                          event.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(
                              /[^a-z0-9-_]/g,
                              ""
                            )
                        )
                      }
                      helperText="Example: data-collection. Each anchor must be unique."
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        minHeight: 56,
                        alignItems: "center",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={
                              section.showInNavigation !==
                              false
                            }
                            onChange={(event) =>
                              handleSectionChange(
                                sectionIndex,
                                "showInNavigation",
                                event.target.checked
                              )
                            }
                          />
                        }
                        label="Show in navigation"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={
                              section.showDivider !== false
                            }
                            onChange={(event) =>
                              handleSectionChange(
                                sectionIndex,
                                "showDivider",
                                event.target.checked
                              )
                            }
                          />
                        }
                        label="Show bottom divider"
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  mb={2}
                >
                  Content Blocks
                </Typography>

                {(section.blocks || []).length === 0 && (
                  <Box
                    sx={{
                      border: "1px dashed #ccc",
                      borderRadius: 1,
                      py: 4,
                      px: 2,
                      textAlign: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      This section does not have any content
                      blocks.
                    </Typography>
                  </Box>
                )}

                {(section.blocks || []).map(
                  (block, blockIndex) => (
                    <BlockEditor
                      key={block.id || blockIndex}
                      block={block}
                      blockIndex={blockIndex}
                      blockCount={
                        section.blocks?.length || 0
                      }
                      sectionIndex={sectionIndex}
                      onChange={handleBlockChange}
                      onDelete={handleDeleteBlock}
                      onDuplicate={
                        handleDuplicateBlock
                      }
                      onMove={handleMoveBlock}
                      onItemChange={
                        handleBlockItemChange
                      }
                      onAddItem={handleAddBlockItem}
                      onDeleteItem={
                        handleDeleteBlockItem
                      }
                      onMoveItem={
                        handleMoveBlockItem
                      }
                    />
                  )
                )}

                <AddBlockControl
                  onAdd={(blockType) =>
                    handleAddBlock(
                      sectionIndex,
                      blockType
                    )
                  }
                />
              </CardContent>
            </Card>
          )
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            position: "sticky",
            bottom: 20,
            zIndex: 10,
            py: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              backgroundColor: "#c91f26",
              px: 5,
              py: 1.4,
              boxShadow: 4,
              "&:hover": {
                backgroundColor: "#aa1a20",
              },
            }}
          >
            {saving
              ? "Saving..."
              : "Save Privacy Policy"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PrivacyPolicyCMS;

// ----------------------------------------------------------------------

function AddBlockControl({ onAdd }) {
  const [selectedType, setSelectedType] =
    useState("paragraph");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column",
          sm: "row",
        },
        alignItems: {
          xs: "stretch",
          sm: "center",
        },
        gap: 2,
        mt: 3,
      }}
    >
      <TextField
        select
        label="Block Type"
        value={selectedType}
        onChange={(event) =>
          setSelectedType(event.target.value)
        }
        sx={{
          minWidth: {
            xs: "100%",
            sm: 260,
          },
        }}
      >
        {BLOCK_TYPES.map((blockType) => (
          <MenuItem
            key={blockType.value}
            value={blockType.value}
          >
            {blockType.label}
          </MenuItem>
        ))}
      </TextField>

      <Button
        variant="contained"
        onClick={() => onAdd(selectedType)}
        sx={{
          backgroundColor: "#292929",
          minHeight: 56,
          "&:hover": {
            backgroundColor: "#111",
          },
        }}
      >
        Add Content Block
      </Button>
    </Box>
  );
}

AddBlockControl.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------

function BlockEditor({
  block,
  blockIndex,
  blockCount,
  sectionIndex,
  onChange,
  onDelete,
  onDuplicate,
  onMove,
  onItemChange,
  onAddItem,
  onDeleteItem,
  onMoveItem,
}) {
  const blockLabel =
    BLOCK_TYPES.find(
      (item) => item.value === block.type
    )?.label || block.type;

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 3,
        backgroundColor: "#fafafa",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={600}
          >
            Block {blockIndex + 1}: {blockLabel}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Button
              size="small"
              variant="text"
              disabled={blockIndex === 0}
              onClick={() =>
                onMove(
                  sectionIndex,
                  blockIndex,
                  "up"
                )
              }
            >
              Move Up
            </Button>

            <Button
              size="small"
              variant="text"
              disabled={
                blockIndex === blockCount - 1
              }
              onClick={() =>
                onMove(
                  sectionIndex,
                  blockIndex,
                  "down"
                )
              }
            >
              Move Down
            </Button>

            <Button
              size="small"
              variant="text"
              onClick={() =>
                onDuplicate(
                  sectionIndex,
                  blockIndex
                )
              }
            >
              Duplicate
            </Button>

            <Button
              size="small"
              color="error"
              variant="text"
              onClick={() =>
                onDelete(
                  sectionIndex,
                  blockIndex
                )
              }
            >
              Delete
            </Button>
          </Box>
        </Box>

        <BlockFields
          block={block}
          blockIndex={blockIndex}
          sectionIndex={sectionIndex}
          onChange={onChange}
          onItemChange={onItemChange}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          onMoveItem={onMoveItem}
        />
      </CardContent>
    </Card>
  );
}

BlockEditor.propTypes = {
  block: blockShape.isRequired,
  blockIndex: PropTypes.number.isRequired,
  blockCount: PropTypes.number.isRequired,
  sectionIndex: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onItemChange: PropTypes.func.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onMoveItem: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------

function BlockFields({
  block,
  blockIndex,
  sectionIndex,
  onChange,
  onItemChange,
  onAddItem,
  onDeleteItem,
  onMoveItem,
}) {
  switch (block.type) {
    case "paragraph":
      return (
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Paragraph"
          value={block.text || ""}
          onChange={(event) =>
            onChange(
              sectionIndex,
              blockIndex,
              "text",
              event.target.value
            )
          }
        />
      );

    case "subheading":
      return (
        <TextField
          fullWidth
          label="Subheading"
          value={block.text || ""}
          onChange={(event) =>
            onChange(
              sectionIndex,
              blockIndex,
              "text",
              event.target.value
            )
          }
        />
      );

    case "minorHeading":
      return (
        <TextField
          fullWidth
          label="Minor Heading"
          value={block.text || ""}
          onChange={(event) =>
            onChange(
              sectionIndex,
              blockIndex,
              "text",
              event.target.value
            )
          }
        />
      );

    case "notice":
      return (
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Highlighted Notice"
          value={block.text || ""}
          onChange={(event) =>
            onChange(
              sectionIndex,
              blockIndex,
              "text",
              event.target.value
            )
          }
          helperText="This text will appear inside the highlighted notice box."
        />
      );

    case "bulletList":
      return (
        <RepeatableItems
          title="Bullet Items"
          addLabel="Add Bullet"
          items={block.items || []}
          sectionIndex={sectionIndex}
          blockIndex={blockIndex}
          blockType={block.type}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          onMoveItem={onMoveItem}
          renderItem={(item, itemIndex) => (
            <TextField
              fullWidth
              multiline
              minRows={2}
              label={`Bullet ${itemIndex + 1}`}
              value={item.text || ""}
              onChange={(event) =>
                onItemChange(
                  sectionIndex,
                  blockIndex,
                  itemIndex,
                  "text",
                  event.target.value
                )
              }
            />
          )}
        />
      );

    case "definitions":
      return (
        <RepeatableItems
          title="Definitions"
          addLabel="Add Definition"
          items={block.items || []}
          sectionIndex={sectionIndex}
          blockIndex={blockIndex}
          blockType={block.type}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          onMoveItem={onMoveItem}
          renderItem={(item, itemIndex) => (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Definition Title"
                  value={item.title || ""}
                  onChange={(event) =>
                    onItemChange(
                      sectionIndex,
                      blockIndex,
                      itemIndex,
                      "title",
                      event.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Description"
                  value={item.description || ""}
                  onChange={(event) =>
                    onItemChange(
                      sectionIndex,
                      blockIndex,
                      itemIndex,
                      "description",
                      event.target.value
                    )
                  }
                />
              </Grid>
            </Grid>
          )}
        />
      );

    case "cookieCards":
      return (
        <RepeatableItems
          title="Cookie Cards"
          addLabel="Add Cookie Card"
          items={block.items || []}
          sectionIndex={sectionIndex}
          blockIndex={blockIndex}
          blockType={block.type}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          onMoveItem={onMoveItem}
          renderItem={(item, itemIndex) => (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cookie Title"
                  value={item.title || ""}
                  onChange={(event) =>
                    onItemChange(
                      sectionIndex,
                      blockIndex,
                      itemIndex,
                      "title",
                      event.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Cookie Type"
                  value={item.cookieType || ""}
                  onChange={(event) =>
                    onItemChange(
                      sectionIndex,
                      blockIndex,
                      itemIndex,
                      "cookieType",
                      event.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Administered By"
                  value={item.administeredBy || ""}
                  onChange={(event) =>
                    onItemChange(
                      sectionIndex,
                      blockIndex,
                      itemIndex,
                      "administeredBy",
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
                  value={item.description || ""}
                  onChange={(event) =>
                    onItemChange(
                      sectionIndex,
                      blockIndex,
                      itemIndex,
                      "description",
                      event.target.value
                    )
                  }
                />
              </Grid>
            </Grid>
          )}
        />
      );

    case "contactList":
      return (
        <RepeatableItems
          title="Contact Details"
          addLabel="Add Contact Detail"
          items={block.items || []}
          sectionIndex={sectionIndex}
          blockIndex={blockIndex}
          blockType={block.type}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          onMoveItem={onMoveItem}
          renderItem={(item, itemIndex) => (
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Label"
                  value={item.label || ""}
                  onChange={(event) =>
                    onItemChange(
                      sectionIndex,
                      blockIndex,
                      itemIndex,
                      "label",
                      event.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Value Type"
                  value={item.type || "text"}
                  onChange={(event) =>
                    onItemChange(
                      sectionIndex,
                      blockIndex,
                      itemIndex,
                      "type",
                      event.target.value
                    )
                  }
                >
                  {CONTACT_TYPES.map(
                    (contactType) => (
                      <MenuItem
                        key={contactType.value}
                        value={contactType.value}
                      >
                        {contactType.label}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Value"
                  value={item.value || ""}
                  onChange={(event) =>
                    onItemChange(
                      sectionIndex,
                      blockIndex,
                      itemIndex,
                      "value",
                      event.target.value
                    )
                  }
                />
              </Grid>
            </Grid>
          )}
        />
      );

    default:
      return (
        <Typography color="error">
          Unsupported block type: {block.type}
        </Typography>
      );
  }
}

BlockFields.propTypes = {
  block: blockShape.isRequired,
  blockIndex: PropTypes.number.isRequired,
  sectionIndex: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onItemChange: PropTypes.func.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onMoveItem: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------

function RepeatableItems({
  title,
  items,
  addLabel,
  blockType,
  blockIndex,
  sectionIndex,
  renderItem,
  onAddItem,
  onDeleteItem,
  onMoveItem,
}) {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        fontWeight={600}
        mb={2}
      >
        {title}
      </Typography>

      {items.length === 0 && (
        <Box
          sx={{
            border: "1px dashed #d6d6d6",
            borderRadius: 1,
            p: 3,
            mb: 2,
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            No items have been added.
          </Typography>
        </Box>
      )}

      {items.map((item, itemIndex) => (
        <Card
          key={item.id || itemIndex}
          variant="outlined"
          sx={{
            mb: 2,
            backgroundColor: "#fff",
          }}
        >
          <CardContent>
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
                mb: 2,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
              >
                Item {itemIndex + 1}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Button
                  size="small"
                  disabled={itemIndex === 0}
                  onClick={() =>
                    onMoveItem(
                      sectionIndex,
                      blockIndex,
                      itemIndex,
                      "up"
                    )
                  }
                >
                  Up
                </Button>

                <Button
                  size="small"
                  disabled={
                    itemIndex === items.length - 1
                  }
                  onClick={() =>
                    onMoveItem(
                      sectionIndex,
                      blockIndex,
                      itemIndex,
                      "down"
                    )
                  }
                >
                  Down
                </Button>

                <Button
                  size="small"
                  color="error"
                  onClick={() =>
                    onDeleteItem(
                      sectionIndex,
                      blockIndex,
                      itemIndex
                    )
                  }
                >
                  Delete
                </Button>
              </Box>
            </Box>

            {renderItem(item, itemIndex)}
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outlined"
        onClick={() =>
          onAddItem(
            sectionIndex,
            blockIndex,
            blockType
          )
        }
      >
        {addLabel}
      </Button>
    </Box>
  );
}

RepeatableItems.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(blockItemShape).isRequired,
  addLabel: PropTypes.string.isRequired,
  blockType: PropTypes.string.isRequired,
  blockIndex: PropTypes.number.isRequired,
  sectionIndex: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onMoveItem: PropTypes.func.isRequired,
};