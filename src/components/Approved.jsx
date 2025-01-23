import React, { useEffect, useState } from "react";
import { supabase } from "./lib/helper/supbaseCient";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Grid2,
  Modal,
  TextField,
  Typography,
} from "@mui/material";

const Approved = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [modalType, setModalType] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTribute, setSelectedTribute] = useState(null);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    display: "flex",
    gap: "10px",
    flexDirection: "column",
  };

  const fetchMessages = async () => {
    const { data: messages, error: fetchError } = await supabase
      .from("messages")
      .select();

    if (fetchError) throw setError(error);
    setMessages(messages);
    console.log(messages);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async () => {
    try {
      //   let profileImageUrl = null;

      // Step 2: Insert the message into the `messages` table
      //   const { data, error } = await supabase.from("messages").insert([
      //     {
      //       name: formData.name,
      //       location: formData.location,
      //       email: formData.email,
      //       message: formData.message,
      //       profile_image: profileImageUrl, // Insert the image URL
      //       approved: false,
      //     },
      //   ]);

      //   if (error) throw error;

      // Step 3: Clear the form and close the modal
      alert("Data submitted successfully!");
      handleClose();
      await fetchMessages(); // Refresh the messages list
    } catch (error) {
      console.error("Error submitting data:", error.message);
      alert("Error submitting data. Please try again.");
    }
  };

  const openModal = (item) => {
    handleOpen();
    setSelectedTribute(item);
  };

  const handleApprove = async (approved) => {
    try {
      // Toggle the approved state locally
      setSelectedTribute((prev) => ({ ...prev, approved: !approved }));

      // Update the "approved" status in the database
      const { data, error } = await supabase
        .from("messages")
        .update({ approved: !approved })
        .eq("id", selectedTribute.id); // Use the item's ID to update the correct record

      if (error) {
        console.error("Error updating approval status:", error.message);
        throw error;
      }

      console.log("Updated item:", data);
      // Refresh the messages to reflect the update
      fetchMessages();
    } catch (err) {
      console.error("Error handling approval:", err.message);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          width: { xs: "80%" },
          margin: "0 auto",
        }}
      >
        {selectedTribute ? (
          <Box
            sx={{
              ...style,
              width: {
                xs: "115%", // 90% of the viewport width on extra-small screens
                sm: 400, // Fixed width of 400px on small screens and above
              },
              maxHeight: "85%",
              overflow: "scroll",
              borderStyle: "none",
              borderRadius: 3,
              position: "relative", // Allows absolute positioning of the close button
            }}
          >
            {/* Close Button */}
            <Button
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 8,
                mr: 1,
                fontSize: "22px",
                right: 8,
                minWidth: "auto",
                padding: 0,
                background: "transparent",
                color: "black",
                "&:hover": {
                  background: "transparent",
                  color: "black",
                },
              }}
            >
              ✖
            </Button>

            <Grid2 container spacing={10}>
              <Grid2 size={2}>
                {selectedTribute.profile_image && (
                  <img
                    src={selectedTribute.profile_image}
                    alt={`${selectedTribute.name}'s profile`}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </Grid2>
              <Grid2 size={8}>
                <Typography variant="h6" fontSize={17} fontWeight={600}>
                  {selectedTribute.name}
                </Typography>
                <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                  {`${selectedTribute.email}, ${selectedTribute.location} `}
                </Typography>
              </Grid2>
            </Grid2>

            <Typography variant="body1">{selectedTribute.message}</Typography>

            <hr />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              {new Date(selectedTribute.created_at).toLocaleDateString({
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => handleApprove(selectedTribute.approved)}
              sx={{ mt: 2 }}
            >
              {selectedTribute.approved === true ? "Unapprove" : "Approve"}
            </Button>
          </Box>
        ) : (
          <Typography>No Tribute Selected</Typography>
        )}
      </Modal>

      <div className="all-tributes-section">
        <div className="all-tributes-wrapper">
          <h2>All Tributes</h2>

          <div className="all-tributes">
            {messages.map((item, index) => (
              <Card
                key={index}
                sx={{
                  marginY: 2,
                  paddingBottom: "-20px",
                  backgroundColor: "rgba(255,255,255,1)",
                  backdropFilter: "blur(5px)",
                  zIndex: 1,
                }}
                onClick={() => openModal(item)}
              >
                <CardContent>
                  <Grid2 container columnSpacing={10}>
                    <Grid2 size={2}>
                      {item.profile_image && (
                        <img
                          src={item.profile_image}
                          alt={`${item.name}'s profile`}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </Grid2>
                    <Grid2 size={8}>
                      <Typography variant="h6" fontSize={17} fontWeight={600}>
                        {item.name}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                        {` ${item.location} `}
                      </Typography>
                    </Grid2>

                    <Grid2 size={2}></Grid2>
                    <Grid2 size={8}>
                      <Button
                        variant="contained"
                        sx={{
                          //   backgroundColor:
                          //     item.approved === true ? "green" : "orange",
                          fontSize: 14,
                        }}
                      >
                        {/* {item.approved === true ? "Unapprove" : "Approve"} */}
                        View
                      </Button>
                    </Grid2>
                  </Grid2>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Approved;
