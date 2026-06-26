import PropTypes from "prop-types";
import React, {
  useState,
  useEffect,
} from "react";

import {
  Box,
  Card,
  Grid,
  Table,
  Paper,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  CardContent,
  TableContainer,
  CircularProgress,
} from "@mui/material";

import Iconify from "src/components/iconify";

import {
  getAllEnquiries,
  getAllSubscribers,
} from "../../services/leads.service";

export const LeadManagement = () => {
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries,] = useState([]);
  const [subscribers, setSubscribers] = useState([]);

  const fetchData = async () => {
    try {
      const [
        enquiryRes,
        subscriberRes,
      ] = await Promise.all([
        getAllEnquiries(),
        getAllSubscribers(),
      ]);

      setEnquiries(
        enquiryRes.data || []
      );

      setSubscribers(
        subscriberRes.data || []
      );

    } catch (error) {

      console.error(
        error
      );

    } finally {

      setLoading(
        false
      );

    }

  };

  useEffect(() => {

    fetchData();

  }, []);

  const totalEnquiries = enquiries.length;

  const newEnquiries = enquiries.filter(
    (x) =>
      x.status ===
      "NEW"
  ).length;


  if (loading) {

    return (
      <Box
        display="flex"
        justifyContent="center"
        py={10}
      >
        <CircularProgress />
      </Box>
    );

  }

  return (

    <Box p={3}>

      <Typography
        variant="h4"
        fontWeight={700}
        mb={3}
      >
        Lead Management
      </Typography>

      {/* Cards */}
      <Grid
        container
        spacing={3}
        mb={4}
      >

        <Grid
          item
          xs={12}
          md={3}
        >
          <StatCard
            title="Total Enquiries"
            value={
              totalEnquiries
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={3}
        >
          <StatCard
            title="Newsletter Subscribers"
            value={
              newEnquiries
            }
          />
        </Grid>


      </Grid>

      {/* Enquiries */}

      <Card sx={{ mb: 4 }}>

        <CardContent>

          <Typography
            variant="h6"
            mb={2}
          >
            Contact
            Enquiries
          </Typography>

          <TableContainer
            component={
              Paper
            }
          >

            <Table>

              <TableHead>

                <TableRow>

                  <TableCell>
                    Name
                  </TableCell>

                  <TableCell>
                    Email
                  </TableCell>

                  <TableCell>
                    Phone
                  </TableCell>

                  <TableCell>
                    Subject
                  </TableCell>

                </TableRow>

              </TableHead>

              <TableBody>

                {enquiries.map(
                  (
                    row
                  ) => (

                    <TableRow
                      key={
                        row.id
                      }
                    >

                      <TableCell>
                        {
                          row.name
                        }
                      </TableCell>

                      <TableCell>
                        {
                          row.email
                        }
                      </TableCell>

                      <TableCell>
                        {
                          row.phone
                        }
                      </TableCell>

                      <TableCell>
                        {
                          row.subject
                        }
                      </TableCell>

                    </TableRow>

                  )
                )}

              </TableBody>

            </Table>

          </TableContainer>

        </CardContent>

      </Card>

      {/* Subscribers */}

      <Card>

        <CardContent>

          <Typography
            variant="h6"
            mb={2}
          >
            Newsletter
            Subscribers
          </Typography>

          <TableContainer
            component={
              Paper
            }
          >

            <Table>

              <TableHead>

                <TableRow>

                  <TableCell>
                    Email
                  </TableCell>

                  <TableCell>
                    Subscribed On
                  </TableCell>

                  <TableCell>
                    Action
                  </TableCell>

                </TableRow>

              </TableHead>

              <TableBody>

                {subscribers.map(
                  (
                    row
                  ) => (

                    <TableRow
                      key={
                        row.id
                      }
                    >

                      <TableCell>
                        {
                          row.email
                        }
                      </TableCell>

                      <TableCell>

                        {row.subscribed_at
                          ? new Date(
                            row.subscribed_at
                          ).toLocaleDateString()
                          : "-"}

                      </TableCell>

                      <TableCell>

                        <IconButton color="error">

                          <Iconify icon="eva:trash-2-fill" />

                        </IconButton>

                      </TableCell>

                    </TableRow>

                  )
                )}

              </TableBody>

            </Table>

          </TableContainer>

        </CardContent>

      </Card>

    </Box>

  );

};

const StatCard = ({title,value}) => (

  <Card>

    <CardContent>

      <Typography color="text.secondary">
        {title}
      </Typography>

      <Typography
        variant="h4"
        fontWeight={700}
      >
        {value}
      </Typography>

    </CardContent>

  </Card>

);

StatCard.propTypes = {
  title:
    PropTypes.string
      .isRequired,

  value:
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
};

export default LeadManagement;