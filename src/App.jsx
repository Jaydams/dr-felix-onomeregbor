import { useEffect, useState, useRef } from "react";

import { supabase } from "./components/lib/helper/supbaseCient";
import "react-slideshow-image/dist/styles.css";
import { Slide } from "react-slideshow-image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import {
  Card,
  CardContent,
  Grid2,
  ImageList,
  ImageListItem,
  TextField,
} from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import "./App.css";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

function App() {
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [images, setImages] = useState([]);
  const isMobile = window.innerWidth <= 768;
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const videoRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [modalType, setModalType] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [openGallery, setOpenGallery] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTribute, setSelectedTribute] = useState(null);
  const [tributeopen, setTributeopen] = useState(false);

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setOpenGallery(true);
  };

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      let profileImageUrl = null;

      // Step 1: Upload the image to Supabase Storage if provided
      if (imageFile) {
        console.log("Uploading file:", imageFile.name); // Log the file name to debug
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(`images/${fileName}`, imageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError.message);
          alert("Error uploading image. Please try again.");
          return;
        }

        // Get the public URL for the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from("profile-images")
          .getPublicUrl(`images/${fileName}`);
        profileImageUrl = publicUrlData.publicUrl;
      }

      // Step 2: Insert the message into the `messages` table
      const { data, error } = await supabase.from("messages").insert([
        {
          name: formData.name,
          location: formData.location,
          email: formData.email,
          message: formData.message,
          profile_image: profileImageUrl, // Insert the image URL
          approved: false,
        },
      ]);

      if (error) throw error;

      // Step 3: Clear the form and close the modal
      alert("Data submitted successfully!");
      setFormData({ name: "", location: "", email: "", message: "" });
      setImageFile(null); // Clear the file input
      handleClose();
      await fetchMessages(); // Refresh the messages list
    } catch (error) {
      console.error("Error submitting data:", error.message);
      alert("Error submitting data. Please try again.");
    }
  };

  // const images = [
  //   "https://images.unsplash.com/photo-1509721434272-b79147e0e708?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
  //   "https://images.unsplash.com/photo-1506710507565-203b9f24669b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1536&q=80",
  //   "https://images.unsplash.com/photo-1536987333706-fc9adfb10d91?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
  // ];

  const fetchMessages = async () => {
    const { data: messages, error: fetchError } = await supabase
      .from("messages")
      .select()
      .eq("approved", true);

    if (fetchError) throw setError(error);
    setMessages(messages);
    console.log(messages);
  };

  const fetchImages = async () => {
    try {
      // List all files in the "images/images" folder
      const { data, error } = await supabase.storage
        .from("images") // Bucket name
        .list("images", { limit: 100, offset: 0 }); // Folder path

      if (error) {
        throw error;
      }

      if (data.length === 0) {
        console.log("No images found");
        return;
      }

      // Generate public URLs for each file
      const urls = data.map(
        (file) =>
          supabase.storage.from("images").getPublicUrl(`images/${file.name}`)
            .data.publicUrl
      );

      setImageUrls(urls); // Store URLs in state
    } catch (err) {
      console.error("Error fetching images:", err.message);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchImages();
    // const video = videoRef.current;
  }, []);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const openModal = (type) => {
    setModalType(type);
    handleOpen();
  };

  const handleTributeOpen = () => {
    setTributeopen(true);
  };

  const handleTributeClose = () => {
    setTributeopen(false);
  };

  const openTribute = (item) => {
    handleTributeOpen();
    setSelectedTribute(item);
  };

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

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const elements = new Array(9).fill(null);
  const cardMinHeight = isMobile ? "550px" : "350px";

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
        {modalType === "tribute" ? (
          <Box
            sx={{
              ...style,
              width: {
                xs: "115%", // 90% of the viewport width on extra-small screens
                sm: 400, // Fixed width of 400px on small screens and above
              },
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

            {/* Modal Content */}
            <TextField
              required
              id="name"
              label="Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              id="location"
              label="Location"
              fullWidth
              value={formData.location}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              id="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              id="message"
              label="Message"
              multiline
              rows={4}
              fullWidth
              value={formData.message}
              onChange={handleChange}
              margin="normal"
            />
            <label htmlFor="profile-image">Add your image(Optional)</label>
            <input
              name="profile-image"
              type="file"
              placeholder="Upload a new image (optional)"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ mt: 2 }}
            >
              Submit
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              ...style,
              width: {
                xs: "115%", // 90% of the viewport width on extra-small screens
                sm: 400, // Fixed width of 400px on small screens and above
                borderRadius: 5,
              },
              borderStyle: "none",
              position: "relative", // Allows absolute positioning of the close button
              padding: "50px 35px",
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
            <p>You can send your donations to the account details below</p>
            <strong>
              <p>
                2252321584 <br /> Zenith Bank <br /> Onomeregbor Princess Elohor
              </p>
            </strong>
          </Box>
        )}
      </Modal>

      <div className="top-section">
        {/* <video ref={videoRef} autoPlay muted loop width={"100%"}>
          <source
            src="https://cdn.pixabay.com/video/2021/10/27/93480-640562082_large.mp4"
            type="video/mp4"
          />
        </video> */}
        <div className="before-overlay"></div>
        <div className="overlay"></div>

        {isMobile && (
          <img
            className="back-img"
            src="https://tevkzpnpqcqvdtmsdygd.supabase.co/storage/v1/object/public/images/img1_enhanced.png"
          />
        )}

        <div className="carousel-container">
          <h2>In Loving Memory of</h2>
          <h1 style={{ marginBottom: "20px", fontWeight: 900 }}>
            Bishop Dr. <br />
            Felix Onomeregbor
          </h1>

          {/* {isMobile && (
            <p className="intro-text">
              In submission and gratitude to God, we announce the passing of our
              beloved father, Bishop Dr. Felix Onomeregbor, who transitioned to
              glory on Saturday, the 21st of December 2024.{" "}
            </p>
          )} */}

          {!isMobile && (
            <div className="embla" ref={emblaRef}>
              <div className="embla__container">
                {elements.map((_, index) => (
                  <div
                    className="embla__slide"
                    key={index} // Assign a unique key to each div
                    style={{
                      backgroundImage: `url(https://tevkzpnpqcqvdtmsdygd.supabase.co/storage/v1/object/public/images/images/img${
                        index + 1
                      }.jpg)`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="divide">
        {isMobile && (
          <div className="embla" ref={emblaRef}>
            <div className="embla__container">
              {elements.map((_, index) => (
                <div
                  className="embla__slide"
                  key={index} // Assign a unique key to each div
                  style={{
                    backgroundImage: `url(https://tevkzpnpqcqvdtmsdygd.supabase.co/storage/v1/object/public/images/images/img${
                      index + 1
                    }.jpg)`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div className="one">
          {!isMobile && (
            <img
              src="/invite.jpg"
              width={"100%"}
              className="invite-img"
              style={{
                borderRadius: "10px",
                boxShadow: "2px 3px 5px rgba(0,0,0,0.3)",
              }}
            />
          )}
          <h2>Announcement of Transition</h2>
          <p>
            With gratitude to God, we announce the passing of our beloved
            father, Bishop Dr. Felix Onomeregbor, who transitioned to glory on
            Saturday, the 21st of December 2025.
          </p>
          <p>
            He was a cherished father, seasoned prophet, mentor, role model,
            uncle, brother, friend, and a beacon of hope. Fondly called Shammah
            and Omraho 1 to the world, his legacy of love, faith, and dedication
            continues to inspire us all.
          </p>
          <p>
            We humbly ask for your prayers and support during this time as we
            honor his life and treasure the beautiful memories he left behind.
          </p>
          <p>Thank you for standing with us during this moment.</p>
          <p>
            Yours Sincerely,
            <br /> His Children
          </p>
        </div>

        {!isMobile && (
          <div className="two">
            <h2 className="heading">Funeral Arrangements</h2>
            <div className="information">
              <h4>Service of Songs - Fri. 24th January 2025</h4>
              <p>
                Mission Headquarters (Shammah Gospel Mission) Igbogidi town,
                Orhuwhorun, Delta State.
                <br />
                <strong> 3:30PM</strong>
              </p>
            </div>

            <div className="information">
              <h4>Funeral Service - Sat. 25th January 2025</h4>
              <p>
                Mission Headquarters (Shammah Gospel Mission) Igbogidi town,
                Orhuwhorun, Delta State.
                <br />
                <strong> 10:00AM</strong>
              </p>
              <p>
                Entertainment of guests follows at Mercy Haven field, DSC after
                Police post. <br />
                <strong>12:00PM</strong>
              </p>
            </div>

            <div className="information">
              <h4>Thanksgiving Service - Sun. 26th January 2025</h4>
              <p>
                Mission Headquarters (Shammah Gospel Mission) Igbogidi town,
                Orhuwhorun, Delta State.
                <br />
                <strong> 9AM</strong>
              </p>
            </div>
            <p>
              You can reach out to us via the following contact information:
              <p>
                <strong>
                  <a href="tel:08030663525">08030663525</a>

                  <br />
                  <a href="tel:07030625971">07030625971</a>
                </strong>
              </p>
            </p>
            <Button
              variant="contained"
              onClick={() => openModal("donate")}
              style={{
                marginTop: "15px",
                backgroundColor: "orange",
                fontWeight: 700,
                // color: "black",
              }}
            >
              Give in Memory
            </Button>
          </div>
        )}
      </div>

      {isMobile && (
        <div className="mobile-information-container">
          <div className="mobile-information">
            {isMobile && (
              <img
                src="/invite.jpg"
                width={"100%"}
                className="invite-img"
                style={{
                  borderRadius: "10px",
                  boxShadow: "2px 3px 5px rgba(0,0,0,0.3)",
                }}
              />
            )}
            <h2 className="heading">Funeral Arrangements</h2>
            <div className="information">
              <h4>Service of Songs - Fri. 24th January 2025</h4>
              <p>
                Mission Headquarters (Shammah Gospel Mission) Igbogidi town,
                Orhuwhorun, Delta State.
                <br />
                <strong> 3:30PM</strong>
              </p>
            </div>

            <div className="information">
              <h4>Funeral Service - Sat. 25th January 2025</h4>
              <p>
                Mission Headquarters (Shammah Gospel Mission) Igbogidi town,
                Orhuwhorun, Delta State.<strong> 10:00AM</strong>
              </p>
              <p>
                Entertainment of guests follows at Mercy Haven field, DSC after
                Police post.
                <br /> <strong>12:00PM</strong>
              </p>
            </div>

            <div className="information">
              <h4>Thanksgiving Service - Sun. 26th January 2025</h4>
              <p>
                Mission Headquarters (Shammah Gospel Mission) Igbogidi town,
                Orhuwhorun, Delta State.
                <br />
                <strong> 9AM</strong>
              </p>
            </div>
            <p>
              You can reach out to us via the following contact information:
              <p>
                <strong>
                  <a href="tel:08030663525">08030663525</a>,{" "}
                  <a href="tel:07030625971">07030625971</a>
                </strong>
              </p>
            </p>
          </div>
        </div>
      )}

      <div className="tribute-section">
        <div className="tribute-background"></div>
        <div className="tribute-overlay"></div>
        <div className="tribute-container" style={{ width: "80%" }}>
          <h2>Tribute Section</h2>
          <p>
            We invite you to share your memories, prayers, and messages in honor
            of Bishop Dr. Felix Onomeregbor.
          </p>
          <div className="tribues">
            <Carousel
              responsive={responsive}
              swipeable={true}
              draggable={true}
              showDots={isMobile ? false : false}
              infinite={true}
              autoPlay={true}
              autoPlaySpeed={5000}
              customTransition="all 1"
              renderButtonGroupOutside={false}
            >
              {messages.map((item, index) => (
                <Card
                  key={index}
                  sx={{
                    my: 1,
                    mx: { lg: 1.5, md: 1, xs: 0, sm: 0 },
                    padding: 1,
                    backgroundColor: "rgba(255,255,255,1)",
                    backdropFilter: "blur(5px)",
                    zIndex: 1,
                    height: "auto", // Use the conditional value
                  }}
                >
                  <CardContent>
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      {item.profile_image && (
                        <img
                          src={item.profile_image}
                          alt={`${item.name}'s profile`}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                            objectFit: "cover",
                            marginRight: "10px",
                          }}
                        />
                      )}
                      <Typography
                        gutterBottom
                        sx={{ color: "text.secondary", fontSize: 14 }}
                      >
                        <strong style={{ color: "black" }}>
                          {" "}
                          {`${item.name}`}
                        </strong>{" "}
                        wrote on{" "}
                        {`${new Date(item.created_at).toLocaleDateString({
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}`}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: "text.secondary" }}>
                      {item.location}
                    </Typography>
                    <Typography variant="body1">
                      {item.message.length > 200
                        ? `${item.message.substring(0, 200)}...`
                        : item.message}
                    </Typography>
                    <Button onClick={() => openTribute(item)}>Read More</Button>
                  </CardContent>
                </Card>
              ))}
            </Carousel>
          </div>
          <Button
            variant="contained"
            onClick={() => openModal("tribute")}
            sx={{ backgroundColor: "orange", fontWeight: 700 }}
          >
            Add a Tribute Message
          </Button>
        </div>
      </div>

      {isMobile && (
        <div className="gifts-section">
          <div className="gifts-container">
            <h2>Honour Gift</h2>
            <p>
              Join us in celebrating the remarkable memory and legacy of Bishop
              Dr. Felix Onomeregbor by sending in your honour gifts in his name.
            </p>
            <Button
              variant="contained"
              onClick={() => openModal("donate")}
              style={{
                marginTop: "15px",
                backgroundColor: "orange",
                fontWeight: 700,
                // color: "black",
              }}
            >
              Give in Memory
            </Button>
          </div>
        </div>
      )}

      {isMobile && (
        <div className="contact-section">
          <div className="contact-container">
            <h2>Contact Information</h2>
            <p>
              You can reach out to us via the following contact information:
              <br />
              <strong>
                08030663525
                <br />
                07030625971
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* <div className="gallery-section">
        <div
          className="gallery-container"
          style={{
            width: isMobile ? "95%" : "85%",
            margin: isMobile ? "40px auto" : "120px auto",
          }}
        >
          <h2>Gallery Section</h2>
          <ImageList
            sx={{ width: !isMobile ? "85%" : "100%", margin: "0 auto" }}
            variant="masonry"
            cols={isMobile ? 2 : 4}
            gap={!isMobile ? 8 : 8}
          >
            {imageUrls.map((url, index) => (
              <ImageListItem key={index}>
                <img
                  className="gallery-image"
                  src={url}
                  alt={`Image ${index + 1}`}
                  onClick={() => handleImageClick(index)}
                  style={{
                    cursor: "pointer",
                    // width: !isMobile ? "270px" : "100%",
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </div>
        {openGallery && (
          <Lightbox
            open={openGallery}
            close={() => setOpenGallery(false)}
            slides={imageUrls.map((url) => ({ src: url }))}
            index={currentIndex}
            onIndexChange={setCurrentIndex}
          />
        )}
      </div> */}

      <Modal
        open={tributeopen}
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
              onClick={handleTributeClose}
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
          </Box>
        ) : (
          <Typography>No Tribute Selected</Typography>
        )}
      </Modal>
    </>
  );
}

export default App;
