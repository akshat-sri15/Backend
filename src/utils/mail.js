import Mailgen from "mailgen";
import nodemailer from "nodemailer"
const sendEmail=async(options)=>{
    const mail_generator=new Mailgen({
        theme:"default",
        product:{
            name:"Task Manager",
            link:"https://taskmanagerlink.com"
        }
    })
    const emailtext=mail_generator.generatePlaintext(options.mailgenContent);
    const emailhtml=mail_generator.generate(options.mailgenContent);
    const transporter=nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user:process.env.MAILTRAP_SMTP_USER,
            pass:process.env.MAILTRAP_SMTP_PASS
        }
    })
    const mail={
        from:"mail.taskmanager@example.com",
        to:options.email,
        subject:options.subject,
        text:emailtext,
        html:emailhtml
    }
    try{
        await transporter.sendMail(mail);
    }
    catch(error){
        console.error("Email service failed.check your credentials")
    }
    
}
const emailVerificationMailgenContent = (username, verficationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our App! we'are excited to have you on board.",
      action: {
        instructions:
          "To verify your email please click on the following button",
        button: {
          color: "#22BC66",
          text: "Verify your email",
          link: verficationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};  

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset the password of your account",
      action: {
        instructions:
          "To reset your password click on the following button or link",
        button: {
          color: "#22BC66",
          text: "Reset password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};
export{forgotPasswordMailgenContent,emailVerificationMailgenContent,sendEmail};
