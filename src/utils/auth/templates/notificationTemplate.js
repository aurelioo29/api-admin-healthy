const notificationTemplate = () => {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f0f0; padding: 20px 0">
      <tr>
        <td align="center">
          <table width="800" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; font-family: 'Raleway', sans-serif; border-radius: 10px; overflow: hidden; margin: 0 auto;">
            <tr>
              <td style="background-color: green; color: white; padding: 20px; text-align: center;">
                <h1 style="color: white; font-size: 30px; font-weight: 600; margin: 0 auto; letter-spacing: 2px; text-transform: uppercase;">
                  Account Verified!
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding: 30px; font-size: 18px; text-align: justify; color: black;">
                <p>Hello,</p>
                <p>Thank you for verifying your account. Your email has been successfully confirmed and your account is now fully activated.</p>
                <p>You can now log in and enjoy all the features our service has to offer.</p>
                <p>If you did not perform this action, please contact our support team immediately.</p>

                <p style="margin-top: 70px; padding: 20px; border-top: 3px solid #f0f0f0; text-align: center; color: #8e8e8e; font-size: 0.9em;">
                  &copy; ${new Date().getFullYear()}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

module.exports = notificationTemplate;
