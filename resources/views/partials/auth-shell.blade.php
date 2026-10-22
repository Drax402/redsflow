

    <div id="loginView" class="auth-view">
        <div class="login-wrapper">

            <div class="left-side">
                <div class="left-side-frame">
                    <img src="/images/login-left-panel.jpg" alt="REDFLOW — Connecting Blood Types, Sustaining the Flow of Life." class="left-side-image" onerror="this.onerror=null; this.style.display='none'; document.getElementById('leftSideFallbackMsg').style.display='flex';">
                </div>
                <div id="leftSideFallbackMsg" style="display:none; position:absolute; inset:0; align-items:center; justify-content:center; text-align:center; color:#ffb3b3; font-family:var(--font-display); font-size:14px; padding:24px;">
                    Image failed to load.<br>Check that public/images/login-left-panel.jpg exists.
                </div>
            </div>

            <div class="right-side">
                <div class="logo-container">
                    <svg class="blood-drop-logo" viewBox="0 0 24 24">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                        <path fill="#ffffff" d="M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3z"/>
                    </svg>
                    <h2><span>RED</span>FLOW</h2>
                </div>
                <form class="login-form" onsubmit="event.preventDefault(); handleLogin();">
                    <div class="input-group-login">
                        <input type="text" id="loginEmail" placeholder="Email or Username" autocapitalize="off" autocomplete="username" required>
                    </div>
                    <div class="input-group-login">
                        <input type="password" id="loginPassword" placeholder="Password" required>
                        <button type="button" class="toggle-password" onclick="togglePasswordVisibility('loginPassword', this)">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                    </div>
                    <button type="submit" class="login-btn">Login</button>
                </form>
                <div class="links-container">
                    <a class="forgot-password" onclick="openForgotPasswordModal()">Forgot Password</a>
                    <p class="signup-text">Don't have account? <span onclick="openSignupWizard()">Sign up</span></p>
                </div>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="forgotPasswordModal">
        <div class="modal-box signup-wizard-box">
            <button type="button" class="su-close-btn" onclick="closeForgotPasswordModal()"><i class="fa-solid fa-xmark"></i></button>

            <div id="fp-step-1" class="su-step active">
                <div class="su-brand"><span style="color:var(--primary-red);">RED</span>FLOW</div>
                <div class="su-step-title">Forgot Password?</div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-envelope"></i>
                    <input type="email" id="fpEmailInput" placeholder="Enter your registered email">
                </div>
                <p style="font-size:12px; color:#999; text-align:center; margin-bottom:6px;">A 6-digit verification code will be sent directly to your email address.</p>
                <div class="wizard-btn-row">
                    <button type="button" class="wizard-btn-back" onclick="closeForgotPasswordModal()">Cancel</button>
                    <button type="button" class="wizard-btn-next" id="fpSendCodeBtn" onclick="validateFpStep1()">Send Code</button>
                </div>
            </div>

            <div id="fp-step-2" class="su-step">
                <div class="su-brand"><span style="color:var(--primary-red);">RED</span>FLOW</div>
                <div class="su-step-title">Enter Verification Code</div>
                <p class="fp-otp-subtext" id="fpEmailTargetText">Check your email for the 6-digit code.</p>
                <div class="fp-otp-container">
                    <input type="text" maxlength="1" class="fp-otp-input fp-otp" inputmode="numeric">
                    <input type="text" maxlength="1" class="fp-otp-input fp-otp" inputmode="numeric">
                    <input type="text" maxlength="1" class="fp-otp-input fp-otp" inputmode="numeric">
                    <input type="text" maxlength="1" class="fp-otp-input fp-otp" inputmode="numeric">
                    <input type="text" maxlength="1" class="fp-otp-input fp-otp" inputmode="numeric">
                    <input type="text" maxlength="1" class="fp-otp-input fp-otp" inputmode="numeric">
                </div>
                <p class="fp-otp-subtext">Didn't receive the code? <button type="button" class="otp-resend-btn" onclick="resendFpCode(this)">Resend</button></p>
                <div class="wizard-btn-row">
                    <button type="button" class="wizard-btn-back" onclick="goToFpStep(1)">Back</button>
                    <button type="button" class="wizard-btn-next" onclick="validateFpStep2()">Verify</button>
                </div>
            </div>

            <div id="fp-step-3" class="su-step">
                <div class="su-brand"><span style="color:var(--primary-red);">RED</span>FLOW</div>
                <div class="su-step-title">Reset Password</div>
                <div class="fp-password-rules">Must be at least 8 characters with numbers &amp; symbols</div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" id="fpNewPassword" placeholder="New Password">
                    <button type="button" class="wizard-eye-btn" aria-label="Show or hide password" onclick="togglePasswordVisibility('fpNewPassword', this)"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                </div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" id="fpConfirmPassword" placeholder="Confirm Password">
                    <button type="button" class="wizard-eye-btn" aria-label="Show or hide password" onclick="togglePasswordVisibility('fpConfirmPassword', this)"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                </div>
                <div class="wizard-btn-row">
                    <button type="button" class="wizard-btn-back" onclick="goToFpStep(2)">Back</button>
                    <button type="button" class="wizard-btn-next" onclick="validateFpResetPassword()">Reset Password</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="signupModal">
        <div class="modal-box signup-wizard-box">
            <button type="button" class="su-close-btn" onclick="closeSignupWizard()"><i class="fa-solid fa-xmark"></i></button>

            <div id="su-step-1" class="su-step active">
                <div class="su-brand"><span style="color:var(--primary-red);">RED</span>FLOW</div>
                <div class="su-step-title">Terms &amp; Privacy Policy</div>
                <div class="su-terms-box">
                    <h4>REDFLOW Terms &amp; Privacy Policy</h4>
                    <p>Last updated: September 2026</p>
                    <p>Welcome to REDFLOW: A Community Blood Donation Blood Types Digital Master List in Irosin, Sorsogon. Please read these Terms and this Privacy Policy carefully. By creating an account, logging in, or using REDFLOW, you agree to them. If you do not agree, please do not use the system.</p>

                    <h4>1. What REDFLOW Is</h4>
                    <p>REDFLOW is a web-based information and coordination system for authorized Staff and Administrators. It keeps an organized digital master list of voluntary blood donors, their blood types, their donation history, and related records, so that community blood donation information is easier to manage and find.</p>
                    <p>REDFLOW is a record-keeping and coordination tool only. It is not a hospital, a blood bank, a laboratory, or a medical service, and it does not diagnose, treat, screen, or decide who may donate or receive blood.</p>

                    <h4>2. Who May Use REDFLOW</h4>
                    <ul>
                        <li>REDFLOW is only for authorized Staff and Administrators. You must be at least 18 years old to create an account.</li>
                        <li>A new Staff account stays &ldquo;Pending&rdquo; until an Administrator reviews your sign-up information, valid ID, and selfie, and approves it. An Administrator may reject a request if the information is incomplete, unclear, or cannot be verified.</li>
                        <li>You must give true, complete, and current information when you sign up and keep it up to date.</li>
                    </ul>

                    <h4>3. Your Account and Security</h4>
                    <ul>
                        <li>You are responsible for your account and for everything done under it. Do not share your email or password with anyone, and log out when you use a shared device.</li>
                        <li>Passwords must be at least 8 characters and include numbers and symbols.</li>
                        <li>For your protection, after 5 wrong login attempts your account is temporarily locked for 60 seconds.</li>
                        <li>Resetting a forgotten password and changing your password both require a 6-digit verification code sent to your registered email address. The code expires after 10 minutes and can be used only once.</li>
                        <li>Tell an Administrator right away if you think someone else has used your account.</li>
                    </ul>

                    <h4>4. Information We Collect</h4>
                    <p><strong>Account information:</strong> your full name, email address, contact number, sex, birthday, address or barangay, role (Staff or Administrator), and password. Your password is never stored as plain text.</p>
                    <p><strong>Verification documents:</strong> the photo of the front and back of your valid ID and your selfie, submitted only to confirm your identity when you sign up for a Staff account.</p>
                    <p><strong>Donor information entered by authorized users:</strong> a donor&rsquo;s name, blood type, contact number, sex, birthday, barangay or address, weight, eligibility status, allergies, medical conditions, deferral reason, emergency contact name and number, and donation history (donation dates, number of times donated, and amount).</p>
                    <p><strong>Activity information:</strong> when you log in and log out, failed login attempts, your IP address at login, your notifications, and Audit Log entries showing who created, updated, deleted, or exported a donor record and when.</p>
                    <p><strong>Technical information:</strong> session cookies that keep you logged in, and browser storage that keeps a working copy of your data on the device you use. REDFLOW may also load fonts and icons from third-party content delivery networks.</p>
                    <p>REDFLOW does <strong>not</strong> use GPS or live location tracking, does not process payments, does not show advertisements, and does not sell personal information.</p>

                    <h4>5. How We Use Information</h4>
                    <ul>
                        <li>To keep the donor master list and history records, and to help authorized personnel find donors by blood type and barangay for legitimate blood donation coordination.</li>
                        <li>To verify and approve Staff accounts and to manage who has access.</li>
                        <li>To protect the system and the people in it: login security, account lockout, and the Audit Log that records who did what.</li>
                        <li>To send you verification codes by email when you reset or change your password.</li>
                        <li>To show summary statistics such as Monthly Donations and Blood Type Availability, and to send in-app notifications about your account and system activity.</li>
                        <li>To meet legal, institutional, and research requirements, where they apply.</li>
                    </ul>
                    <p>Personal information is not used for unrelated purposes such as advertising, marketing, selling, harassment, or discrimination.</p>

                    <h4>6. How We Protect Information</h4>
                    <ul>
                        <li>Passwords are stored only in a scrambled (hashed) form that cannot be turned back into the original password.</li>
                        <li>Donor names, contact numbers, blood types, and related donor and record details are encrypted (AES-256) in the database. Your ID and selfie photos are also stored encrypted.</li>
                        <li>Information travels between your browser and the server over a secure (HTTPS) connection.</li>
                        <li>Only logged-in, approved users can open donor data. Administrators have extra controls that Staff do not have, and the Audit Log keeps a record of important actions for accountability.</li>
                    </ul>
                    <p>No system can be made 100% secure. We use reasonable organizational and technical safeguards, and we ask every user to do their part by protecting their own account.</p>

                    <h4>7. Who Can See Information</h4>
                    <ul>
                        <li>Approved Staff and Administrators can view donor and record information needed for their work.</li>
                        <li>Only Administrators can review sign-up requests, including the ID and selfie you submitted, and manage user accounts.</li>
                        <li>We do not sell or rent personal information. We share it only when needed for legitimate blood donation coordination with authorized health personnel, or when required by law.</li>
                        <li>Verification emails are delivered through a third-party email service. Only your email address and the verification code are sent to it for delivery.</li>
                    </ul>

                    <h4>8. Third-Party Services</h4>
                    <p>REDFLOW depends on a few outside services to work:</p>
                    <ul>
                        <li>a cloud hosting provider that runs the website and stores the database;</li>
                        <li>an email delivery service that sends your verification codes (it receives only your email address and the code, so the email can be delivered); and</li>
                        <li>content delivery networks (Google Fonts and Font Awesome) that load the fonts and icons you see on screen. When your browser loads them, they may receive basic technical data such as your IP address.</li>
                    </ul>
                    <p>These services have their own terms and privacy policies. Donor information is never shared with them for advertising or any purpose unrelated to running REDFLOW.</p>

                    <h4>9. Cookies and Browser Storage</h4>
                    <ul>
                        <li>A <strong>session cookie</strong> keeps you logged in and ends after a period of inactivity or when you log out.</li>
                        <li>A <strong>security (CSRF) token</strong> protects your requests from being forged by other websites.</li>
                        <li><strong>Browser local storage</strong> keeps a working copy of the donor list, records, and notifications on the device you use, so pages load faster. It is refreshed from the server and stays on the device until it is replaced or you clear your browser data, so avoid using REDFLOW on public or shared devices.</li>
                    </ul>
                    <p>REDFLOW does not use advertising or tracking cookies.</p>

                    <h4>10. How Long We Keep Information</h4>
                    <p>We keep information only as long as it is needed for the purposes above. Administrators may delete donor records, history records, and user accounts. When a sign-up request is rejected, or an account is deleted, the ID and selfie stored for that account are deleted with it. Audit Log entries may be kept for accountability.</p>

                    <h4>11. Your Data Privacy Rights (Republic Act No. 10173)</h4>
                    <p>REDFLOW follows the Data Privacy Act of 2012 (RA 10173) and its principles of transparency, legitimate purpose, and proportionality. Because a person&rsquo;s blood type and health-related details are sensitive personal information, they are handled with extra care. Under the law you have the right to:</p>
                    <ul>
                        <li>be informed about how your personal data is collected and used;</li>
                        <li>access your personal data;</li>
                        <li>object to processing, and give or withdraw your consent;</li>
                        <li>correct inaccurate or outdated data;</li>
                        <li>request the removal or blocking of your data, where allowed by law;</li>
                        <li>receive a copy of your data in a usable format;</li>
                        <li>be compensated for damages caused by unlawful use of your data; and</li>
                        <li>file a complaint with the National Privacy Commission.</li>
                    </ul>
                    <p>To use any of these rights, contact the REDFLOW Administrator.</p>

                    <h4>12. Acceptable Use</h4>
                    <p>You agree that you will:</p>
                    <ul>
                        <li>use REDFLOW only for legitimate community blood donation coordination and administration;</li>
                        <li>enter accurate, verified information and avoid duplicate or outdated records;</li>
                        <li>keep donor information confidential and never copy, export, share, or post it without authorization;</li>
                        <li>never use donor information to harass, threaten, discriminate against, advertise to, or profit from anyone; and</li>
                        <li>never try to access another account, bypass security, disrupt the system, or use it for anything unlawful.</li>
                    </ul>
                    <p>Breaking these rules may lead to suspension or removal of your access, and to administrative or legal action where applicable.</p>

                    <h4>13. Accuracy and Medical Disclaimer</h4>
                    <p>Blood types and other details in REDFLOW are only as accurate as the information entered. A blood type in the master list must not be treated as a final medical result. Being listed as a donor does not guarantee that a person is eligible, available, or compatible at the time of a request. Screening, blood typing, compatibility testing, and transfusion decisions must always be done by qualified healthcare professionals at authorized facilities.</p>

                    <h4>14. Suspension and Termination</h4>
                    <p>An Administrator may suspend, restrict, or remove an account that breaks these Terms, puts donor information or the system at risk, or was created with false information. You may stop using REDFLOW at any time and may ask an Administrator to delete your account. Deleting an account also deletes the ID and selfie stored for it.</p>

                    <h4>15. Personal Data Breach</h4>
                    <p>If a personal data breach happens that is likely to put people at risk, we will act quickly to contain it and will notify the affected persons and the National Privacy Commission as required by RA 10173 and its rules.</p>

                    <h4>16. Governing Law</h4>
                    <p>These Terms and this Privacy Policy are governed by the laws of the Republic of the Philippines, including the Data Privacy Act of 2012 (RA 10173).</p>

                    <h4>17. Contact</h4>
                    <p>For questions, corrections, or privacy concerns about your information, please contact the REDFLOW Administrator.</p>

                    <p style="margin-top:10px; font-size:11.5px;">Register and login to see the full About page for the complete Terms and Conditions, Privacy Policy, and User Agreement.</p>
                </div>
                <div class="checkbox-row">
                    <input type="checkbox" id="suTermsConsent"> <label for="suTermsConsent">I have read and agree to the Terms and Conditions</label>
                </div>
                <div class="checkbox-row">
                    <input type="checkbox" id="suPrivacyConsent"> <label for="suPrivacyConsent">I consent to the Data Privacy Policy under RA 10173</label>
                </div>
                <p class="su-age-notice">By continuing, you confirm you are 18 years old and above.</p>
                <div class="wizard-btn-row">
                    <button type="button" class="wizard-btn-back" onclick="closeSignupWizard()">Decline</button>
                    <button type="button" class="wizard-btn-next" onclick="validateSuStep1()">Continue</button>
                </div>
            </div>

            <div id="su-step-2" class="su-step">
                <div class="su-brand"><span style="color:var(--primary-red);">RED</span>FLOW</div>
                <div class="su-step-title">Enter Your Information</div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-user"></i>
                    <input type="text" id="suFullname" placeholder="Full Name" oninput="suOnFullnameInput()">
                </div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-at"></i>
                    <input type="text" id="suUsername" placeholder="Username" maxlength="30" autocapitalize="off" autocomplete="off" oninput="suOnUsernameInput()">
                </div>
                <div class="su-hint" id="suUsernameHint">A username is suggested from your name — you can change it.</div>
                <div class="su-chips" id="suUsernameChips"></div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-phone"></i>
                    <div class="ph-wrap"><span class="ph-prefix">+63</span><input type="tel" id="suContact" placeholder="9XXXXXXXXX" maxlength="10" inputmode="numeric" oninput="this.value=this.value.replace(/\D/g,'').replace(/^0+/,'').slice(0,10)"></div>
                </div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-calendar"></i>
                    <input type="date" id="suDob" title="Date of Birth (must be 18 or above)" min="1900-01-01">
                </div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-venus-mars"></i>
                    <select id="suGender">
                        <option value="" disabled selected>Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="wizard-btn-row">
                    <button type="button" class="wizard-btn-back" onclick="goToSignupStep(1)">BACK</button>
                    <button type="button" class="wizard-btn-next" onclick="validateSuStep2()">NEXT</button>
                </div>
            </div>

            <div id="su-step-3" class="su-step">
                <div class="su-step-title" style="color:#d32f2f;">Location Details</div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-earth-asia"></i>
                    <input type="text" value="Philippines" disabled style="background:var(--bg-light); color:var(--text-muted);">
                </div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-map"></i>
                    <input type="text" value="Bicol Region" disabled style="background:var(--bg-light); color:var(--text-muted);">
                </div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-location-dot"></i>
                    <input type="text" value="Sorsogon" disabled style="background:var(--bg-light); color:var(--text-muted);">
                </div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-city"></i>
                    <input type="text" value="Irosin" disabled style="background:var(--bg-light); color:var(--text-muted);">
                </div>
                <div class="wizard-input-group">
                    <i class="fa-solid fa-house-chimney"></i>
                    <select id="suBrgy">
                        <option value="" disabled selected>Select Barangay</option>
                        <option value="Bacolod">Bacolod</option>
                        <option value="San Agustin">San Agustin</option>
                        <option value="San Juan">San Juan</option>
                        <option value="San Julian">San Julian</option>
                        <option value="San Pedro">San Pedro</option>
                        <option value="Bagsangan">Bagsangan</option>
                        <option value="Batang">Batang</option>
                        <option value="Bolos">Bolos</option>
                        <option value="Buenavista">Buenavista</option>
                        <option value="Bulawan">Bulawan</option>
                        <option value="Carriedo">Carriedo</option>
                        <option value="Casini">Casini</option>
                        <option value="Cawayan">Cawayan</option>
                        <option value="Cogon">Cogon</option>
                        <option value="Gabao">Gabao</option>
                        <option value="Gulang-Gulang">Gulang-Gulang</option>
                        <option value="Gumapia">Gumapia</option>
                        <option value="Liang">Liang</option>
                        <option value="Macawayan">Macawayan</option>
                        <option value="Mapaso">Mapaso</option>
                        <option value="Monbon">Monbon</option>
                        <option value="Patag">Patag</option>
                        <option value="Salvacion">Salvacion</option>
                        <option value="San Isidro">San Isidro</option>
                        <option value="Santo Domingo">Santo Domingo</option>
                        <option value="Tabon-Tabon">Tabon-Tabon</option>
                        <option value="Tinampo">Tinampo</option>
                        <option value="Tongdol">Tongdol</option>
                    </select>
                </div>
                <div class="wizard-btn-row">
                    <button type="button" class="wizard-btn-back" onclick="goToSignupStep(2)">BACK</button>
                    <button type="button" class="wizard-btn-next" onclick="validateSuStep3()">NEXT</button>
                </div>
            </div>

            <div id="su-step-4" class="su-step">
                <div class="su-brand"><span style="color:var(--primary-red);">RED</span>FLOW</div>
                <div class="su-step-title">Valid ID Verification</div>
                <input type="file" id="suIdFrontFile" accept="image/*" style="display:none;" onchange="handleSuIdUpload(this, 'front')">
                <div class="su-id-box">
                    <i class="fa-solid fa-id-card"></i>
                    <div class="su-id-label">Front of ID</div>
                    <div class="su-id-status" id="suIdFrontStatus">Take a photo of your ID</div>
                    <img id="suIdFrontPreview" style="display:none;" alt="Front ID preview">
                    <div class="su-id-actions">
                        <button type="button" onclick="openIdCamera('front')"><i class="fa-solid fa-camera"></i> Take Photo</button>
                        <button type="button" class="alt" onclick="document.getElementById('suIdFrontFile').click()"><i class="fa-solid fa-upload"></i> Upload</button>
                    </div>
                </div>
                <input type="file" id="suIdBackFile" accept="image/*" style="display:none;" onchange="handleSuIdUpload(this, 'back')">
                <div class="su-id-box">
                    <i class="fa-solid fa-id-card"></i>
                    <div class="su-id-label">Back of ID</div>
                    <div class="su-id-status" id="suIdBackStatus">Take a photo of your ID</div>
                    <img id="suIdBackPreview" style="display:none;" alt="Back ID preview">
                    <div class="su-id-actions">
                        <button type="button" onclick="openIdCamera('back')"><i class="fa-solid fa-camera"></i> Take Photo</button>
                        <button type="button" class="alt" onclick="document.getElementById('suIdBackFile').click()"><i class="fa-solid fa-upload"></i> Upload</button>
                    </div>
                </div>
                <p style="font-size:11.5px; color:#999; text-align:center; margin-bottom:6px;">Place your ID card clearly in the frame. Ensure all details are readable.</p>
                <div class="wizard-btn-row">
                    <button type="button" class="wizard-btn-back" onclick="goToSignupStep(3)">BACK</button>
                    <button type="button" class="wizard-btn-next" onclick="validateSuStep4()">NEXT</button>
                </div>
            </div>

            <div id="su-step-5" class="su-step">
                <div class="su-brand"><span style="color:var(--primary-red);">RED</span>FLOW</div>
                <div class="su-subtitle">Verification &gt; Selfie Check</div>
                <div class="su-step-title" style="margin-bottom:12px;">Verification</div>
                <div class="su-selfie-frame">
                    <video id="suSelfieVideo" autoplay playsinline></video>
                    <canvas id="suSelfieCanvas" style="display:none;"></canvas>
                    <img id="suSelfiePreview" style="display:none;" alt="Captured Selfie">
                    <div id="suFaceGuide" class="face-guide" style="display:none;"></div>
                </div>
                <p style="font-size:12.5px; color:#666; text-align:center; margin-bottom:10px;" id="suSelfieInstruction">Allow camera access, then look straight at the camera.</p>
                                <div class="wizard-btn-row">
                    <button type="button" class="wizard-btn-back" id="suRetakeBtn" style="display:none;" onclick="retakeSuSelfie()">Retake</button>
                    <button type="button" class="wizard-btn-next" id="suSelfieActionBtn" onclick="suActionClick()">Refresh</button>
                </div>
                <div style="display:flex; justify-content:center; align-items:center; gap:20px; margin-top:10px;">
                    <button type="button" class="wizard-btn-back" style="flex:none; padding:10px 14px; font-size:12px;" onclick="stopSuSelfieCamera(); goToSignupStep(4);">Back to ID</button>
                </div>
            </div>

            <div id="su-step-6" class="su-step">
                <div class="su-brand"><span style="color:var(--primary-red);">RED</span>FLOW</div>
                <div class="su-step-title">Create Account</div>
                <div class="form-group-custom">
                    <label>Email Address</label>
                    <input type="email" id="suEmail" placeholder="halimbawa@gmail.com" oninput="suCheckEmailLive(false)" onblur="if (suCheckEmailLive(true)) { suEmailIsTaken(this.value).then(function (t) { if (t) suWarnEmailTaken(); }); }">
                </div>
                <div class="su-hint" id="suEmailHint"></div>
                <div class="form-group-custom" style="position:relative;">
                    <label>Create Password</label>
                    <input type="password" id="suPassword" placeholder="Enter password" onfocus="suGuardPasswordFocus(this)">
                    <button type="button" class="toggle-password" onclick="togglePasswordVisibility('suPassword', this)" style="position:absolute; right:10px; top:30px; background:none; border:none; cursor:pointer; color:#999;"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                </div>
                <div class="form-group-custom" style="position:relative;">
                    <label>Confirm Password</label>
                    <input type="password" id="suConfirmPassword" onfocus="suGuardPasswordFocus(this)" placeholder="Re-enter password">
                    <button type="button" class="toggle-password" onclick="togglePasswordVisibility('suConfirmPassword', this)" style="position:absolute; right:10px; top:30px; background:none; border:none; cursor:pointer; color:#999;"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                </div>
                <p class="password-guide">Password must be at least 8 characters with numbers &amp; symbols.</p>
                <div class="wizard-btn-row">
                    <button type="button" class="wizard-btn-back" onclick="goToSignupStep(5)">BACK</button>
                    <button type="button" class="wizard-btn-next" onclick="validateSuStep6()">NEXT</button>
                </div>
            </div>

            <div id="su-step-7" class="su-step">
                <div class="su-step-title">Review Your Information</div>
                <div class="su-summary-avatar" title="Your profile photo (taken with the camera)">
                    <img id="suSummaryAvatar" src="{{ asset('images/picture.jpg') }}" alt="Avatar preview" onerror="this.onerror=null;this.src='/images/picture.jpg'">
                </div>
                <div style="text-align:center; font-size:12px; color:var(--text-muted); margin-bottom:15px;">This camera photo becomes your profile picture.</div>
                <div class="form-group-custom">
                    <label>Full Name</label>
                    <input type="text" id="suSummaryFullname">
                </div>
                <div class="form-group-custom">
                    <label>Username</label>
                    <input type="text" id="suSummaryUsername" readonly style="background:var(--bg-light); cursor:not-allowed;">
                </div>
                <div class="form-row-dual">
                    <div class="form-group-custom">
                        <label>Contact Number</label>
                        <input type="text" id="suSummaryContact">
                    </div>
                    <div class="form-group-custom">
                        <label>Sex</label>
                        <input type="text" id="suSummaryGender">
                    </div>
                </div>
                <div class="form-row-dual">
                    <div class="form-group-custom">
                        <label>Birthday</label>
                        <input type="text" id="suSummaryDob">
                    </div>
                    <div class="form-group-custom">
                        <label>Role</label>
                        <input type="text" id="suSummaryRole" readonly style="background:#e9ecef; color:#495057; cursor:not-allowed;">
                    </div>
                </div>
                <div class="form-group-custom">
                    <label>Barangay</label>
                    <input type="text" id="suSummaryBrgy">
                </div>
                <div class="form-group-custom">
                    <label>Email Address</label>
                    <input type="text" id="suSummaryEmail">
                </div>
                <button type="button" id="suSubmitApprovalBtn" class="action-main-btn" style="background:var(--primary-red);" onclick="confirmSuSignup()">Submit for Approval</button>
                <div class="wizard-btn-row" style="margin-top:10px;">
                    <button type="button" class="wizard-btn-back" onclick="goToSignupStep(6)">BACK</button>
                </div>
            </div>

            <div id="su-step-8" class="su-step" style="text-align:center;">
                <div class="su-pending-icon"><i class="fa-solid fa-hourglass-half"></i></div>
                <div class="su-step-title">Sign Up Submitted!</div>
                <p style="text-align:center; color:var(--text-muted); font-size:13.5px; margin-bottom:20px;">Your Staff account is now <strong>Pending</strong>. Please wait for an Admin to review and approve your ID and selfie verification before you can log in.</p>
                <button type="button" class="action-main-btn" style="background:var(--primary-red);" onclick="closeSignupWizard()">Back to Login</button>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="staffApprovalModal">
        <div class="modal-box" style="width: 550px; text-align: left;">
            <h3 style="text-align: center; color: var(--primary-red);">PENDING STAFF APPROVALS</h3>
            <p style="text-align: center; margin-bottom: 15px;">Approve or reject Staff sign-up requests</p>

            <div id="pendingStaffList" style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;">

            </div>

            <div style="text-align: right;">
                <button type="button" class="modal-btn btn-cancel" onclick="closeModal('staffApprovalModal')">Close</button>
            </div>
        </div>
    </div>

    <div class="image-zoom-overlay" id="imageZoomOverlay" onclick="closeImageZoom()">
        <span class="image-zoom-close" onclick="closeImageZoom()">&times;</span>
        <img id="imageZoomTarget" src="" alt="Zoomed Document" onclick="event.stopPropagation()">
    </div>

<div class="modal-overlay" id="idCameraModal" style="z-index:4000;">
    <div class="modal-box" style="width:460px;">
        <h3 id="idCameraTitle">Take Photo of ID</h3>
        <div class="id-cam-wrap">
            <video id="idCameraVideo" class="id-cam-video" autoplay playsinline muted></video>
            <div id="idCameraGuide" class="id-cam-guide bad" style="display:none;"></div>
        </div>
        <canvas id="idCameraCanvas" style="display:none;"></canvas>
        <p id="idCameraMsg" style="font-size:12.5px; margin:10px 0;">Place your ID inside the frame. Make sure all details are readable.</p>
        <div class="modal-buttons">
            <button type="button" class="modal-btn btn-cancel" onclick="closeIdCamera()">Cancel</button>
            <button type="button" class="modal-btn btn-confirm" id="idCameraShotBtn" onclick="refreshIdCamera()"><i class="fa-solid fa-rotate"></i> Refresh</button>
        </div>
    </div>
</div>
