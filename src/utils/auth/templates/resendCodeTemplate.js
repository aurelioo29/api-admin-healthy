const resendCodeTemplate = (code) => {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f0f0; padding: 20px 0">
      <tr>
        <td align="center">
          <table width="800" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; font-family: 'Raleway', sans-serif; border-radius: 10px; overflow: hidden; margin: 0 auto;">
            <tr>
              <td style="background-color: green; color: white; padding: 20px; text-align: center;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 15px;">
                      <img
                        src="https://img.freepik.com/premium-vector/one-time-password-otp-security-verification-illustration_258153-461.jpg"
                        alt="OTP Image"
                        width="100%"
                        style="display: block; margin: 0 auto; max-width: 300px; border-radius: 10px;"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h1 style="color: white; font-size: 30px; font-weight: 550; margin: 0 auto; letter-spacing: 3px; text-transform: uppercase; text-align: center;">
                        Verify your sign-up account
                      </h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 30px; font-size: 18px; text-align: justify; color: black;">
                <p>We have received a sign-up attempt with the following code. Please enter it in the browser window where you started signing up account.</p>
                <p style="background-color: #eff2f1; text-align: center; font-weight: bold; padding: 30px; margin: 30px 0; border-radius: 10px; font-size: 32px;">
                  ${code}
                </p>
                <p style="color: #7b7b7b">If you did not attempt to sign up but received this email, please disregard it. The code will remain active for 5 minutes. You may request a new code after <strong>3 minutes</strong> if needed.</p>
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

module.exports = resendCodeTemplate;
