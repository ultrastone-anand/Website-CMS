import * as XLSX from "xlsx";
import React, { useRef, useState, useEffect } from "react";

import {
  Box,
  Chip,
  Stack,
  Alert,
  Paper,
  Table,
  Button,
  Divider,
  TableRow,
  MenuItem,
  TextField,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  TableContainer,
} from "@mui/material";

import { getCategories } from "src/services/category.service";
import { getLookupDetails } from "src/services/lookup.service";
import { bulkuploadProduct } from "src/services/product.service";

import Iconify from "src/components/iconify";

const yesNo = (value) =>
  String(value).trim().toLowerCase() === "yes";

const getResistance = (row, prefix) => {
  if (row[`#${prefix}low`]) return "LOW";
  if (row[`#${prefix}med`]) return "MEDIUM";
  if (row[`#${prefix}high`]) return "HIGH";

  return null;
};

const generateSlug = (text = "") =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const mapExcelRowToPayload = (row) => ({
  name: row.productname || "",
  slug: generateSlug(
    row.productname || ""
  ),
  category: row.Category || "",
  stone_group: row.Group || "",
  origin_country: row.Origin || "",

  abrasion_resistance: getResistance(row, "abr"),
  stain_resistance: getResistance(row, "str"),
  etching_resistance: getResistance(row, "etchre"),
  heat_resistance: getResistance(row, "hetr"),
  uv_resistance: getResistance(row, "uv"),
  color_range: getResistance(row, "colr"),
  movement_index: getResistance(row, "mvmt"),

  color_enhancing: yesNo(row.colorenhance),

  countertops_vanities: yesNo(row.countertops),
  interior_floor: yesNo(row.interiorflor),
  fireplace: yesNo(row.fireplce),
  shower_wall: yesNo(row.showerwall),
  shower_floor: yesNo(row.showerflor),
  exterior_floor: yesNo(row.exteriorflor),
  exterior_wall: yesNo(row.exteriorwall),
  pool_fountain: yesNo(row.poolfuntain),
  furniture_top: yesNo(row.furnituretop),

  translucent: yesNo(row.translucent),
  cut_to_size: yesNo(row.cutsize),

  pattern: row.pattern || "",
  sealer: row.sealer || "",

  thicknesses_cm: row.thickness
    ? row.thickness.split("/").map((v) => v.trim())
    : [],

  finishes_available: row.finish
    ? row.finish.split("/").map((v) => v.trim())
    : [],

  average_sizes_inches: row.size
    ? [row.size]
    : [],
});

export default function BulkUpload() {
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [stone_group, setStone_group] = useState([])
  const [finishes_available, setFinishes_available] = useState([]);
  const [thicknesses_cm, setThicknesses_cm] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  useEffect(() => {
    fetchStonegroup();
    fetchCountries();
    loadCategories();
    fetchThickness();
    fetchFinish();
  }, []);

  const fetchFinish = async () => {
    try {
      const response =
        await getLookupDetails(5);

      setFinishes_available(response.data || []);
    } catch (error) {
      console.error(
        'Failed to load Finishes:',
        error
      );
    }
  };

  const fetchThickness = async () => {
    try {
      const response =
        await getLookupDetails(4);

      setThicknesses_cm(response.data || []);
    } catch (error) {
      console.error(
        'Failed to load Thickness:',
        error
      );
    }
  };

  const fetchStonegroup = async () => {
    try {
      const response =
        await getLookupDetails(2);

      setStone_group(response.data || []);
    } catch (error) {
      console.error(
        'Failed to load Stone Groups:',
        error
      );
    }
  };

  const fetchCountries = async () => {
    try {
      const response =
        await getLookupDetails(3);

      setCountries(response.data || []);
    } catch (error) {
      console.error(
        'Failed to load countries:',
        error
      );
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();

      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const findStoneGroup = (value) =>
    stone_group.find(
      (item) =>
        item.value_name?.trim().toLowerCase() ===
        value?.trim().toLowerCase()
    );

  const findCountry = (value) =>
    countries.find(
      (item) =>
        item.value_name?.trim().toLowerCase() ===
        value?.trim().toLowerCase()
    );

  const findThicknesses = (values = []) =>
    values
      .map((value) =>
        thicknesses_cm.find(
          (item) =>
            item.value_name?.trim().toLowerCase() ===
            value?.trim().toLowerCase()
        )
      )
      .filter(Boolean);

  const findFinishes = (values = []) =>
    values
      .map((value) =>
        finishes_available.find(
          (item) =>
            item.value_name?.trim().toLowerCase() ===
            value?.trim().toLowerCase()
        )
      )
      .filter(Boolean);

const handleUploadProducts = async () => {
  try {
    if (!products.length) {
      alert("Please upload an Excel file first");
      return;
    }

    if (!selectedCategoryId) {
  alert("Please select category first");
  return;
}

    setUploading(true);

    const slugTracker = {};


    const finalPayload = products.map(
      (product) => {


        const stoneGroup =
          findStoneGroup(
            product.stone_group
          );

        const country =
          findCountry(
            product.origin_country
          );

        const thicknesses =
          findThicknesses(
            product.thicknesses_cm
          );

        const finishes =
          findFinishes(
            product.finishes_available
          );

          let slug = generateSlug(product.name);

if (slugTracker[slug]) {
  slugTracker[slug] += 1;
  slug = `${slug}-${slugTracker[slug]}`;
} else {
  slugTracker[slug] = 1;
}

        return {
          ...product,

          slug,

  category_id: selectedCategoryId,


          stone_group:
            stoneGroup?.value_name ||
            "",

          origin_country:
            country?.value_name ||
            "",

          thicknesses_cm:
            thicknesses.map(
              (item) => item.value_name
            ),

          finishes_available:
            finishes.map(
              (item) => item.value_name
            ),
        };
      }
    );

    console.log(
      finalPayload, "finalPayload"
    )

    const response =await bulkuploadProduct(finalPayload);

    console.log(
      "UPLOAD RESPONSE",
      response
    );

    alert(
      `${finalPayload.length} products uploaded successfully`
    );

    setProducts([]);
    setFileName("");
  } catch (error) {
    console.error(error);

    alert(
      error.message ||
        "Upload failed"
    );
  } finally {
    setUploading(false);
  }
};
  const handleExcelUpload = async (e) => {
    try {
      const file = e.target.files?.[0];

      if (!file) return;

      setFileName(file.name);

      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data);

      const sheet =
        workbook.Sheets[
        workbook.SheetNames[0]
        ];

      const rows =
        XLSX.utils.sheet_to_json(sheet);

      const mappedProducts =
        rows.map(mapExcelRowToPayload);

      setProducts(mappedProducts);

      console.log(
        "Mapped Products:",
        mappedProducts
      );
    } catch (error) {
      console.error(
        "Excel Import Error",
        error
      );
    }
  };


  const columns = [
    "name",
    "slug",
    "category",
    "stone_group",
    "origin_country",
    "abrasion_resistance",
    "stain_resistance",
    "etching_resistance",
    "heat_resistance",
    "uv_resistance",
    "color_range",
    "movement_index",
    "color_enhancing",
    "countertops_vanities",
    "interior_floor",
    "fireplace",
    "shower_wall",
    "shower_floor",
    "exterior_floor",
    "exterior_wall",
    "pool_fountain",
    "furniture_top",
    "translucent",
    "cut_to_size",
    "pattern",
    "sealer",
    "thicknesses_cm",
    "finishes_available",
    "average_sizes_inches",
  ];

  const renderCellValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return value || "-";
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: "1px solid #e5e7eb",
          mb: 3,
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
          >
            Bulk Product Upload
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
          >
            Upload Excel file and preview
            all products before saving.
          </Typography>

          <TextField
  select
  fullWidth
  label="Select Category"
  value={selectedCategoryId}
  onChange={(e) => setSelectedCategoryId(e.target.value)}
  sx={{
    maxWidth: 600,
  }}
>
  {categories.map((category) => (
    <MenuItem key={category.id} value={category.id}>
      {category.name}
    </MenuItem>
  ))}
</TextField>

          <Button
            variant="contained"
            size="large"
            startIcon={<Iconify icon="eva:upload-fill" />}
            onClick={() =>
              fileInputRef.current?.click()
            }
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
            }}
          >
            Upload Excel
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcelUpload}
            hidden
          />

          {fileName && (
            <Alert
              icon={<Iconify icon="eva:checkmark-circle-2-fill" />}
              severity="success"
              sx={{
                width: "100%",
                maxWidth: 600,
              }}
            >
              <strong>Selected File:</strong>{" "}
              {fileName}
            </Alert>
          )}
        </Stack>
      </Paper>



      {products.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <Box p={3}>
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
              <Typography
                variant="h5"
                fontWeight={700}
              >
                Product Preview
              </Typography>

              <Stack
                direction="row"
                spacing={2}
              >
                <Chip
                  color="primary"
                  label={`${products.length} Products Found`}
                />

                <Button
                  variant="contained"
                  color="success"
                  disabled={
                    uploading ||
                    products.length === 0
                  }
                  onClick={handleUploadProducts}
                >
                  {uploading
                    ? "Uploading..."
                    : "Upload Products"}
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          <TableContainer
            sx={{
              maxHeight: "75vh",
            }}
          >
            <Table
              stickyHeader
              size="small"
            >
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column}
                      sx={{
                        fontWeight: 700,
                        textTransform:
                          "capitalize",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {column.replaceAll(
                        "_",
                        " "
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {products.map(
                  (product, index) => (
                    <TableRow
                      hover
                      key={index}
                    >
                      {columns.map(
                        (column) => (
                          <TableCell
                            key={column}
                            sx={{
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {renderCellValue(product[column])}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}