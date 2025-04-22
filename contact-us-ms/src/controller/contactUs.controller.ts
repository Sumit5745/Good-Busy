import ContactUs, { IContactUs } from "../models/contactUs";

// Submit contact form
export const submitContactForm = async (req: any, res: any) => {
  try {
    const { username, email, subject, message }: IContactUs = req.body;

    // Create new contact form submission
    const contactForm = new ContactUs({
      username,
      email,
      subject,
      message,
    });

    await contactForm.save();

    return res.status(201).json({
      success: true,
      message: req.__("CONTACT_US_SUBMITTED_SUCCESS"),
      data: contactForm,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return res.status(500).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};

// Get all contact form submissions (admin only)
export const getContactSubmissions = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const submissions = await ContactUs.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContactUs.countDocuments();

    return res.status(200).json({
      success: true,
      message: req.__("CONTACT_US_FETCH_SUCCESS"),
      data: {
        submissions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    return res.status(500).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};
