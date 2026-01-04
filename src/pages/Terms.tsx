import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms of Service | Voiceable"
        description="Voiceable Terms of Service - Please read these Terms carefully, as they constitute a legally binding agreement between Voiceable Inc. and you."
        keywords="terms of service, terms and conditions, legal agreement, user agreement"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com/terms"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Voiceable Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last Updated: February 27, 2025</p>

            <section className="mb-8">
              <p className="text-foreground mb-4">
                Please read these Terms of Service (these "Terms") carefully, as they constitute a legally binding agreement between Voiceable Inc., a Delaware corporation ("Voiceable," "we," "us" or "our") and an end-user and any employees, agents, contractors and any other entity on whose behalf the end-user accepts these terms (collectively, "you" and "your") and apply to your use of our website and Services (as defined below). In case you are utilizing the Services as a representative of a party (e.g. your employer or customer, collectively the "Client"), your acceptance of these Terms also binds the Client.
              </p>
              <p className="text-foreground mb-4">
                This is a binding agreement. If you use the Services or click accept or agree to these Terms if presented to you in a user interface for the Services, or you have signed a subscription agreement that serves as a master agreement, you are legally bound by the obligations in these Terms. If you are entering into these Terms on behalf of a Client, you represent and warrant that you have the authority to bind the Client to these Terms, and any reference to "you" and "your" will refer and apply to that party. If you do not agree to all of these Terms, you shall not use the Service and you should not set up an Account (as defined).
              </p>
              <p className="text-foreground">
                By agreeing to these Terms, you expressly agree that except for limited circumstances, the parties will only resolve disputes by arbitration, solely on an individual basis.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of these Terms</h2>
              <p className="text-foreground mb-4">
                You hereby agree to accept these Terms by opening an account under a username, notwithstanding any existing services agreement to which you may also be signatory which incorporated these Terms by reference.
              </p>
              <p className="text-foreground mb-4">
                You also agree to abide by other Voiceable rules and policies, including our Privacy Policy (which explains what information we collect from you and how we protect it) that are expressly incorporated into and are a part of these Terms. Please read them carefully.
              </p>
              <p className="text-foreground">
                Once you accept these Terms you are bound by them until they are terminated. See Section 7 (Term and Termination).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Using the Services</h2>
              
              <h3 className="text-xl font-semibold mb-2 mt-4">a. Right to Use and License</h3>
              <p className="text-foreground mb-4">
                Subject to your compliance with these Terms, Voiceable hereby grants you a non-exclusive, non-transferable, non-assignable, non-sublicensable, and revocable (i) right to use the Services and (ii) where applicable in cases of on premise installations, license to object code that is installed in your Systems (where "Systems" means computing machine running code, whether on your premise or on a 3rd party's cloud platform), solely for the purposes of utilizing the Service to deploy AI voice agents and solely in the manner described in these Terms and in any technical documentation contained in, or provided with, the Services.
              </p>
              <p className="text-foreground mb-4">
                You acknowledge and agree that you are only being granted a right to use the Services and nothing is being sold to you. You do not acquire any ownership interest in the Services under these Terms, or any other rights thereto, other than to use the Service in accordance with the use rights specified and other terms, conditions, and restrictions of these Terms. We reserve all other rights that are not granted in these Terms.
              </p>
              <p className="text-foreground mb-4">
                See Section 4 for more details on your use and Intellectual Property Rights (as defined) under these Terms.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">b. What We Provide</h3>
              <p className="text-foreground mb-4">
                The Services include but are not limited to a hosted software solution ("Platform") that allows you to create voice agents that can interact with your customers and stakeholders and respond to queries by such individuals in the most realistic manner possible.
              </p>
              <p className="text-foreground mb-4">
                Our Platform (think of it as an orchestration layer over three modules that are provided by various suppliers as well as a collection of tools, including a web dashboard ("Dashboard")), that allows you to, either via our API or via the Dashboard, utilize a transcribing service module and intake or record stakeholder speech (usually on your device), followed by the transcription of the speech to text (either on your device or in a cloud server), and then the processing of the text on a trained large language model ("LLM" or "AI Model") to generate responses, and then the conversion of text to speech to be delivered to the stakeholder (using the voice module) (the Platform and additional value adds, such as phone numbers that connect to our Platform, but excluding Providers' offering, collectively, the "Services").
              </p>
              <p className="text-foreground mb-4">
                Our Platform stitches together the various modules' individual steps to provide a smooth and responsive conversation, which is notable not only for being latency-optimized, but also for being realistic, as our custom models create a conversational experience that feels human, utilizing tools with respect to managing endpointing, interruptions, filtering of background noise and voice, and more. For more details see How Voiceable Works on our website.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">c. Third-Parties</h3>
              <p className="text-foreground mb-4">
                Our control layer interacts with our third-party service providers (our "Providers") as part of Services or parties that you wish to utilize. We expect our Providers list to grow with time. You understand and agree that when you use the various aspects of the Services (i.e. the transcription (i.e. through providers such as Deepgram), the LLM processing (we support any OpenAI-compatible endpoint, including Azure OpenAI, or your own custom LLM) and our voice generation (all voice providers are supported)), we will be sharing Your Content (as defined) with each Provider, subject to each Provider's individual terms and conditions. We do not make any representation and warranties on any Provider's behalf, nor are we an agent of any such Provider. We principally provide you a control layer to obtain the best experience possible for AI-enabled voice agents using each such Provider's capabilities.
              </p>
              <p className="text-foreground mb-4">
                Our Services are very flexible and our Platform allows you to conveniently customize which third parties you would like to use as part of the Services (whether our Providers or your own, including your own AI Models). If you have existing accounts with any of our Providers, you can bring your own API keys to Voiceable. You can add them in the Dashboard under the Provider Keys tab. Once your API key is validated, you won't be charged when using that provider through Voiceable. Instead, you'll be charged directly by the provider. The fees we charge you bundles in the usage fee from each of our Providers on a per use basis and our fee will be modified accordingly. Enterprise customers shall be subject to custom pricing schemes. For more details on customization and other details on our Service, check out our collection of Documents which will assist you in leveraging our Services efficiently.
              </p>
              <p className="text-foreground mb-4">
                You will in certain instances, need to have separate subscriptions with our Providers. For instance, if you would like to utilize the benefits of certain voice generation module providers (i.e. ElevenLabs or PlayHT) you will need to subscribe to an API plan that suits your needs with the respective Provider, as further described in out documentation on our website.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">d. Use Restrictions</h3>
              <p className="text-foreground mb-4">You agree to not, directly or indirectly (and will not permit any third party) to:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
                <li>do anything with the Services other than use them for your own use as intended under these Terms, including not to license, sell, rent, lease, transfer, assign, reproduce, distribute, host or otherwise commercially exploit the Services or any portion of the Services;</li>
                <li>use the Services in any way that would violate applicable law or otherwise give rise to criminal or civil liability;</li>
                <li>create AI voice agents using our Services for any illegal purpose</li>
                <li>use Voiceable's name, trademarks, service marks, trade names, designs, logos, photos, or any other materials we make available via the Services, except as allowed by these Terms;</li>
                <li>remove, alter or destroy any copyright notices or other proprietary markings (trademarks, service marks or other proprietary notices) contained on or in the Services or infringe Voiceable's Intellectual Property Rights (as defined);</li>
                <li>copy, modify, translate, adapt, merge, archive, download, upload, disclose, distribute, sell, lease, syndicate, broadcast, perform, display, make available, make derivatives of, or otherwise use the Services or its content on the Services, other than as expressly permitted by these Terms or enabled by the Services' intended functionality, except to the extent the foregoing restrictions are expressly prohibited by applicable law;</li>
                <li>reverse engineer, duplicate, decompile, disassemble, or decode any part of the software we provide or the Services, or otherwise extract the source code of the software of the Service;</li>
                <li>use any robot, spider, crawler, scraper, avatar, miner or other manual or automated means to access the Services, "scrape" or download data from any part of our Platform or our website, or extract any information that doesn't relate to Your Content;</li>
                <li>upload viruses or other malicious code or otherwise compromise, bypass, or circumvent the security of the Services;</li>
                <li>disrupt or hinder (or try to do so) any of the Service's web pages, connected servers or networks, or technical systems of a Provider, or not follow protocols or guidelines linked to the Service;</li>
                <li>try to detect, scan, or test any vulnerabilities of the Services or any of our or our Provider's system or network, or breach or override any security or authentication protections for the Services;</li>
                <li>pretend to be someone else or falsely represent your association with any other entity;</li>
                <li>access the Service in ways that are not authorized by these Terms; or</li>
                <li>leverage the Service to produce datasets for neural network training, machine modeling, or developing templates or products for third-party.</li>
                <li>use the Services in a manner that violates the Health Insurance Portability and Accountability Act (HIPAA) or the Payment Card Industry Data Security Standard (PCI DSS). If you intend to process, transmit, or store protected health information (PHI) or payment card information (PCI Data), you must enable the appropriate settings within the Services to designate your AI assistant as HIPAA- and/or PCI-compliant. Failure to properly configure these settings constitutes a material breach of these Terms, and you acknowledge that Voiceable is not responsible for your failure to comply with HIPAA or PCI requirements.</li>
              </ul>
              <p className="text-foreground mb-4">
                In all cases, Voiceable will determine in our sole discretion whether any action of an end-user violates the above rules. Violation of the above rules is a breach of these Terms.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">e. Service Updates</h3>
              <p className="text-foreground mb-4">
                You understand that the Services will evolve from time to time. You acknowledge and agree that Voiceable may update the Services on the Platform with or without notifying you, including adding or removing features, products, or functionalities. Voiceable may also require you to accept updates to the software that you have installed on your System as applicable.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">f. Fees</h3>
              <p className="text-foreground mb-4">
                Usage of our Services is subject to the fees that are set out on our website. The fees you pay will be directly correlated with the amount of voice minutes processed through Voiceable volume transmitted to our Platform.
              </p>
              <p className="text-foreground mb-4">
                Nothing prevents us from revising the monthly fees charged for our Services, or introducing new features and benefits and charging additional amounts. Your costs under any subscription to our Services will not change until your then current term of subscription (e.g. if you are a monthly subscriber, then at the end of the month we revise our fees).
              </p>
              <p className="text-foreground">
                Our fees are separate and apart from the fees our Providers charge or those third parties that you may have subscribed to yourself. For more detailed examples of fee scenarios, see our website for billing guidance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Creating an Account</h2>
              
              <h3 className="text-xl font-semibold mb-2 mt-4">a. Registration</h3>
              <p className="text-foreground mb-4">
                To access the Services, you must register and obtain login credentials for an account ("Account") and provide information as prompted by the account registration flow. You represent and warrant that: (a) all registration information you submit is truthful and accurate; and (b) you will maintain and promptly update such information to keep it true, accurate, current and complete. You may delete your Account at any time, for any reason in accordance with Section 7(b).
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">b. Eligibility</h3>
              <p className="text-foreground mb-4">
                The Services are only available to end-users who can form legally binding contracts under applicable law. By accessing or using the Services, you represent and warrant that you are at least 18 years of age or over the age of majority in the state or country where you are a resident or citizen. You are not eligible to be a Client or an end-user if you are barred from using the Services under the laws of the United States or any other applicable jurisdiction, including pursuant to Section 15 (Export Control) in these Terms.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">c. User Information & Credentials</h3>
              <p className="text-foreground">
                When you create an Account with Voiceable, you will be asked to choose a username and password. You acknowledge and agree that you are exclusively responsible for the security and confidentiality of your login credentials and for all use of the Services and all related charges that may arise from such use of the Services in connection with your login credentials, with or without your knowledge. You may not share your Account or password with anyone, and you agree to notify Voiceable immediately of any actual or suspected unauthorized use of your Account, your password or any other breach of security as related to the Services, including on any hardware device which you may use to access our Services. Each end user must maintain their own credentials.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property Rights, Ownership and Grants</h2>
              
              <h3 className="text-xl font-semibold mb-2 mt-4">a. Your Content</h3>
              <p className="text-foreground mb-4">
                When you utilize our Service, all materials uploaded to or transmitted via the Platform is your content ("Your Content"). You own all rights and title in Your Content, including any Intellectual Property Rights (as defined). Voiceable does not claim any ownership of Your Content or assert any rights under your Intellectual Property Rights other than as granted under these Terms.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">b. Rights You Grant Us</h3>
              <p className="text-foreground mb-4">
                You hereby grant Voiceable a worldwide, royalty-free, sublicensable license to host, store, cache, use, display, reproduce, modify, adapt, edit, analyze, transmit, and distribute ("Handle") Your Content during the Term. This license to Handle is solely for the purpose of us and our Providers providing you the Services.
              </p>
              <p className="text-foreground mb-4">
                The specific information you permit us to Handle is determined by customizable settings that are in your control.
              </p>
              <p className="text-foreground mb-4">
                Our API has a "hipaaEnabled" option, that limits Voiceable's use of data if set to the "True" setting. If set to "True", data persistence (which refers to the ability of data to survive after the call is made to the Platform is completed) is disabled, Voiceable would only has access to data inserted into the Platform via the Dashboard / API until deleted as per retention policy or manually by you and no call logs, recordings, or transcriptions are stored by us during or after your call. No information may be utilized for training our AI model.
              </p>
              <p className="text-foreground mb-4">
                Alternatively, if "hipaaEnabled" option set to "False", call data persistence is enabled, and we would have access to all audio data, transcripts, and data injected into the Platform via the Dashboard / API until deleted as per retention policy or manually by you. In this case, you grant us a right to use persisted call data on model training for either Voiceable proprietary model or on-premise hosted models for call improvement features, including but not limited to end-of-turn and interruption detection.
              </p>
              <p className="text-foreground mb-4">
                We do not utilize Your Content to obtain any customer specific intelligence. Our scope of use of data in all instances is only for purposes of enhancing call features, latency and the performance of your AI voice agents, and does not in any way relate to capturing and using personal information of any caller or any information/inputs of a caller in respect of your business or the caller.
              </p>
              <p className="text-foreground mb-4">
                You agree that submission of any ideas, suggestions, documents, and/or proposals to Voiceable ("Feedback") is at your own risk and that Voiceable has no obligations (including without limitation obligations of confidentiality) with respect to such Feedback. You represent and warrant that you have all rights necessary to submit the Feedback. You hereby grant to Voiceable a fully paid, royalty-free, perpetual, irrevocable, worldwide, non-exclusive, and fully sublicensable and transferable right and license to use, reproduce, perform, display, distribute, adapt, modify, re-format, create derivative works of, and otherwise commercially or non-commercially exploit in any manner, any and all Feedback for any purpose.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">c. Voiceable's Rights</h3>
              <p className="text-foreground mb-4">
                The Services utilize technology and capabilities and contain certain materials provided by us as well as our licensors, including but not limited to, all proprietary LLM, content, information, software, images, text, graphics, illustrations, logos, and (as applicable) audio and video. Voiceable and its licensors reserve all ownership and Intellectual Property Rights to all parts of our Services. For the purposes of these Terms, "Intellectual Property Rights" means all (i) patents, patent disclosures, and inventions (whether patentable or not), (ii) trademarks, (iii) copyrights and copyrightable works (including computer programs), and rights in data and databases, and (iv) all other intellectual property rights, in each case whether registered or unregistered and including all applications for, and renewals or extensions of, such rights, and all similar or equivalent rights or forms of protection in any part of the world. Your use rights, as set out under Section 2 above are subject to compliance with these Terms and as applicable payment of the applicable fees.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">d. Rights Granted to Third Parties</h3>
              <p className="text-foreground">
                Providers that deliver part of our Services, whether pursuant to a contract directly with you or though us, require rights to Handle Your Content as applicable to the service they provide. Each Provider has its own contractual terms that apply. Please review the specific terms of service or equivalent agreement which apply to the Provider that you elect to utilize in respect of each of the Service module for transcription, LLM, and voice generation. While we expect each Provider to comport to industry norms and comply with their privacy policies and the license and rights granted to them under terms agreed upon with you, we do not monitor nor make any guarantees or warranties in respect of their compliance with their contractual and legal obligations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Aggregate Stats</h2>
              <p className="text-foreground">
                Voiceable shall monitor your use of the Services, including the Platform, and collect and compile data and information related to all such use in an aggregate and anonymized manner, including to compile statistical and performance information related to the provision and operation of the Platform ("Aggregated Statistics"). Such Aggregated Statistics are wholly owned by the Company with all rights reserved and may be used for operating, developing, providing, promoting, and improving the Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Communications</h2>
              <p className="text-foreground">
                By entering into these Terms or using the Services, you agree to receive communications from us, including via email, and/or push notifications. Communications from us may include, but are not limited to, operational communications concerning your Account or the use of the Services, updates concerning new and existing features on the Services, and news concerning Voiceable and industry developments.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Term and Termination</h2>
              
              <h3 className="text-xl font-semibold mb-2 mt-4">a. Term</h3>
              <p className="text-foreground mb-4">
                These Terms commence on the earlier of the date you first opened an Account to use the Services or the date when you accepted these Terms, and these Terms will remain in full force and effect while you use the Services, unless terminated earlier in accordance with this Section.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">b. Termination by Voiceable</h3>
              <p className="text-foreground mb-4">
                If you have breached any provision of these Terms, if Voiceable is required to do so by law (e.g., where the provision of the Services is, or becomes, unlawful), or if it is commercially impracticable for Voiceable to provide the Services, Voiceable has the right to, immediately and without notice, suspend or terminate any of the Services provided to you.
              </p>
              <p className="text-foreground mb-4">
                You agree that all terminations will be made in Voiceable's sole discretion and that Voiceable will not be liable to you or any third party for any termination of your Account, provided that if applicable, Voiceable shall refund you any prepaid amount, on a pro-rata basis, for any duration of the term of subscription to our Service which remains after the termination of your Account.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">d. Termination by You</h3>
              <p className="text-foreground mb-4">
                Other than the clauses which survive any expiry or termination of these Terms, these Terms (with surviving terms excepted) shall not apply to you upon your notice to us requesting Services no longer be provided.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">e. Effect of Termination</h3>
              <p className="text-foreground mb-4">
                If Services are terminated for any reason, your use rights shall cease and you may not be able to access your Account and all related information or files associated with or inside your Account (or any part thereof) may be deleted. Voiceable will not have any liability whatsoever to you for any suspension or termination.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">f. Survival</h3>
              <p className="text-foreground">
                The following Sections shall survive any termination of your use right: This Section 7(f), Sections 4(a), 4(b)(ii), 4(c), 4(d), 7(e), 9, 10, 11, 12, 14, 16, and 19.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
              <p className="text-foreground mb-4">
                These Terms are subject to occasional revision by Voiceable. When changes are made, Voiceable will make a new copy of these Terms of Service available on the website and within the App. We will also update the date at the top of these Terms. If we make any substantial changes, and you have registered with us to create an Account, we will also send an email to you at the last e-mail address you provided to us to notify you. Any changes to these Terms will be effective immediately for new registered users of the Services and will be effective 30 days after posting notice of such changes on the website for existing registered users, provided that any material changes will be effective for registered users who have an Account with us upon the earlier of 30 days after posting notice of such changes on the website or 30 days after dispatch of an e-mail notice of such changes to registered users. Voiceable may require you to provide consent to the updated Terms in a specified manner before further use of the Services is permitted. IF YOU DO NOT AGREE TO ANY CHANGES AFTER RECEIVING A NOTICE OF SUCH CHANGE(S), YOU WILL STOP USING THE SERVICES. OTHERWISE, YOUR CONTINUED USE OF THE SERVICES CONSTITUTES YOUR ACCEPTANCE OF SUCH CHANGES.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Indemnity</h2>
              
              <h3 className="text-xl font-semibold mb-2 mt-4">a. Your Indemnification Obligation</h3>
              <p className="text-foreground mb-4">
                You agree, to the extent permitted by law, to indemnify, defend, and hold harmless Voiceable, our directors, officers, stockholders, employees, licensors, providers, and agents ("Voiceable Parties") from and against any and all claims, demands, losses, liabilities, damages, costs, and expenses (including reasonable attorneys' fees) (collectively, "Losses") due to, arising out of, or relating in any way to: (a) your access to or use of the Services; (b) your breach of these Terms, any rights of another party, or any applicable law or regulation, including but not limited to the Telephone Consumer Protection Act of 1991 (TCPA), the Telemarketing and Consumer Fraud and Abuse Prevention Act, and their implementing regulations; or (c) your negligence or willful misconduct. Voiceable reserves the right, at its own cost, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you will fully cooperate with Voiceable in asserting any available defenses. You agree that the provisions in this section will survive any termination of your Account, these Terms and/or your access to the Services.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">b. Indemnification by Voiceable</h3>
              <p className="text-foreground mb-4">
                Voiceable will defend, indemnify and hold harmless each you and as applicable your officers, directors, employees, contractors and licensors (collectively, "Subscriber Indemnitees"), from and against any costs, damages (including reasonable attorneys' fees) that are awarded in final judgment against or paid in settlement in connection with any action or suit brought against a Subscriber Indemnitee by a third party based upon a third-party claim that (i) the Services, as provided by Voiceable pursuant to these Terms (exclusive of any Your Content), infringe any Intellectual Property Rights or misappropriate any trade secret, or (ii) arises from or relate to the gross negligence, willful misconduct, fraud or more culpable acts or omissions of Voiceable, violation of applicable law by Voiceable, or any breach by Voiceable of any of its representations or warranties hereunder. Subscriber Indemnitees agree to provide Voiceable reasonable cooperation, at Voiceable's expense, in the defense and settlement of such claim, and Voiceable shall have sole authority to defend or settle such claim, provided (y) no settlement shall require payment or a confession or admission of fault by any Subscriber Indemnitees or require any Subscriber Indemnitee to take (or refrain from taking) any action without the applicable Subscriber Indemnitee's prior written consent and (z) if such claim relates to any Intellectual Property Rights or Confidential Information of the Subscriber Indemnitees, the Subscriber Indemnitees shall have sole control of the defense and settlement of such claim.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">c. Injunctions</h3>
              <p className="text-foreground mb-4">
                If your use of the Services is, or in Voiceable's reasonable opinion is likely to be, enjoined due to claims specified in Section 9(b), then Voiceable may at its sole option and expense (without limiting Voiceable's indemnity obligation to Subscriber Indemnitees): (a) replace or modify the Services to make them non-infringing and of substantially equivalent functionality; (b) procure for you the right to continue using the Services under these Terms; or (c) terminate your rights and Voiceable's obligation under these Terms with respect to Services and refund to you a pro-rata portion of the fees paid in advance by you in respect of the Services.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">d. Exclusions</h3>
              <p className="text-foreground mb-4">
                Notwithstanding the terms of Sections 9(b) (Indemnification by Voiceable) and 9(c) (Injunctions), Voiceable will have no liability for any infringement or misappropriation claim of any kind to the extent that it results from: (a) any modification or alteration of the Services by Subscriber Indemnitee or existing employees, agents or contractors other than as permitted in these Terms, or any user's failure to reasonably safeguard login credentials, if such claim would not have occurred but for such modification or alteration, or (b) Subscriber's or a user's use of the Services other than as permitted in these Terms.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">e. Sole Remedy</h3>
              <p className="text-foreground">
                THE FOREGOING STATES THE ENTIRE OBLIGATION OF Voiceable AND ITS OFFICERS, DIRECTORS, EMPLOYEES, PERMITTED CONTRACTORS, AND LICENSORS WITH RESPECT TO ANY INFRINGEMENT OR MISAPPROPRIATION OF SUCH THIRD-PARTY INTELLECTUAL PROPERTY RIGHTS.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Disclaimer of Warranties and Conditions</h2>
              
              <h3 className="text-xl font-semibold mb-2 mt-4">a.</h3>
              <p className="text-foreground mb-4">
                You expressly understand and agree that, to the extent permitted by applicable law, your use of the Services is at your sole risk, and the Services are provided on an "as is" and "as available" basis, with all faults. Voiceable expressly disclaims all warranties, representations, and conditions of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">b.</h3>
              <p className="text-foreground mb-4">
                Except as explicitly provided hereunder, Voiceable makes no representation, warranty, or condition with respect to the Services, including but not limited to, the quality, effectiveness, and other characteristics of the Services, and of those of the Providers. Except as provided under a service level agreement, Voiceable makes no representation or warranty that the Services will be uninterrupted, error-free, or timely. The Services may be subject to delays, cancellations and other disruptions.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">c.</h3>
              <p className="text-foreground mb-4">
                No advice or information, whether oral or written, obtained from Voiceable or through the Services will create any warranty not expressly made in these terms.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">d.</h3>
              <p className="text-foreground">
                Unless you have limited the traffic flow to certain limits, we do not stop incoming voice calls to our Platform. As such, you are responsible for payment of all the minutes utilized on our Platform, regardless of whether the voice traffic exceeded your contemplation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
              
              <h3 className="text-xl font-semibold mb-2 mt-4">a. Disclaimer of Certain Damages</h3>
              <p className="text-foreground mb-4">
                TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO EVENT WILL A PARTY BE LIABLE FOR ANY LOSS OF PROFITS, REVENUE OR DATA, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, OR DAMAGES OR COSTS DUE TO LOSS OF PRODUCTION OR USE, BUSINESS INTERRUPTION, OR PROCUREMENT OF SUBSTITUTE GOODS OR SERVICE, IN EACH CASE WHETHER OR NOT THE PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF THE SERVICES.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">b. Cap on Liability</h3>
              <p className="text-foreground mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, EACH PARTY WILL NOT BE LIABLE BEYOND THE GREATER OF (i) $100 USD, (ii) THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE DATE OF THE ACTIVITY GIVING RISE TO THE CLAIM. THESE LIMITATIONS AND EXCLUSIONS REGARDING DAMAGES APPLY EVEN IF ANY REMEDY FAILS TO PROVIDE ADEQUATE COMPENSATION.
              </p>
              <p className="text-foreground">
                SOME COUNTRIES, STATES, PROVINCES, OR OTHER JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OF LIABILITY AS STATED IN THIS SECTION, SO THE TERMS HEREIN MAY NOT FULLY APPLY TO YOU.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law and Dispute Resolution</h2>
              
              <h3 className="text-xl font-semibold mb-2 mt-4">a. Governing Law</h3>
              <p className="text-foreground mb-4">
                These Terms and all related orders and subscriptions related hereto, and all matters arising out of or relating to these Terms, are governed by, and construed in accordance with, the laws of the State of California, without giving effect to the conflict of laws provisions thereof.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">b. Arbitration</h3>
              <p className="text-foreground mb-4">
                You and Voiceable agree that any controversy, allegation, or claim that arises out of or relates to the Service, these Terms, or any additional terms, whether heretofore or hereafter arising (collectively, a "Dispute") arising out of will be resolved by binding arbitration, rather than in court, except for: (1) any controversy, allegation, or claim that arises out of or relates to our actual or alleged intellectual property rights; (2) any claim related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorized use; (3) any claim for equitable relief.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">c. Informal Dispute Resolution</h3>
              <p className="text-foreground mb-4">
                You and Voiceable agree that good faith informal efforts to resolve disputes can result in a prompt, low‐cost and mutually beneficial outcome. You and Voiceable therefore agree that before either party commences arbitration against the other (or initiates an action in small claims court (which you agree shall only be done in the city of San Francisco, California) if a party so elects), we will personally meet or confer telephonically or via videoconference, in a good faith effort to resolve informally any Dispute covered by this clause ("Informal Dispute Resolution Conference"). If you are represented by counsel, your counsel may participate in the conference at your cost, but you will also participate in the conference.
              </p>
              <p className="text-foreground mb-4">
                The party initiating a Dispute must give notice to the other party in writing of its intent to initiate an Informal Dispute Resolution Conference ("Notice"), which will occur within 45 days after the other party receives such Notice, unless an extension is mutually agreed upon by the parties. Notice to Voiceable that you intend to initiate an Informal Dispute Resolution Conference should be sent by email to support@voiceable.ai. The Notice must include: (1) your name, telephone number, mailing address, e‐mail address associated with your Account (if you have one); (2) the name, telephone number, mailing address and e‐mail address of your counsel, if any; and (3) a description of your dispute. Your email must be followed up with a written mailed notice to our address at support@voiceable.ai.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">d. Waiver of Jury Trial</h3>
              <p className="text-foreground mb-4">
                YOU AND Voiceable HEREBY WAIVE ANY CONSTITUTIONAL AND STATUTORY RIGHTS TO SUE IN COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR A JURY. You and Voiceable are instead electing that all disputes will be resolved by arbitration under these Terms, except as set out under Section 12(b) above.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">e. Waiver of Class and Other Non-Individualized Relief</h3>
              <p className="text-foreground mb-4">
                YOU AND Voiceable AGREE THAT, EXCEPT AS SPECIFIED IN SECTION, EACH OF US MAY BRING CLAIMS AGAINST THE OTHER ONLY ON AN INDIVIDUAL BASIS AND NOT ON A CLASS, REPRESENTATIVE, OR COLLECTIVE BASIS, AND THE PARTIES HEREBY WAIVE ALL RIGHTS TO HAVE ANY DISPUTE BE BROUGHT, HEARD, ADMINISTERED, RESOLVED, OR ARBITRATED ON A CLASS, COLLECTIVE, REPRESENTATIVE, OR MASS ACTION BASIS.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">f. Rules and Forum</h3>
              <p className="text-foreground">
                These Terms evidence a transaction involving interstate commerce; and notwithstanding any other provision in these Terms with respect to the applicable substantive law, the Federal Arbitration Act, 9 U.S.C. § 1 et seq., will govern the interpretation and enforcement of this Section 12 and any arbitration proceedings. If the Informal Dispute Resolution Process described above does not resolve satisfactorily within sixty (60) days after receipt of your Notice, you and Voiceable agree that either party will have the right to finally resolve the Dispute through binding arbitration. The arbitration will be administered by the American Arbitration Association ("AAA"), in accordance with the AAA Commercial Arbitration Rules then in effect in the city of San Francisco, California, by one arbitrator alone and such arbitrator will have exclusive authority to resolve any dispute, including, without limitation, disputes arising out of or related to the interpretation or application of this Section 12, including the enforceability, revocability, scope, or validity of the arbitration requirement or any portion of this Section 12.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. International Use</h2>
              <p className="text-foreground">
                The Services can be accessed from countries around the world and may contain references to features and services that are not available in your country. Voiceable makes no representations that the Services are appropriate or available for use in other locations. Those who access or use the Services from other countries do so at their own volition and are responsible for compliance with local laws. If you are using the Services and are not in the United States, you agree that the location for dispute resolution is acceptable to you and that you will not challenge the forum as being inconvenient for you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Severability, Waiver</h2>
              <p className="text-foreground">
                If any provision of these Terms is found unenforceable, then that provision will be severed from these Terms and not affect the validity and enforceability of any remaining provisions. Any waiver or failure to enforce any provision of these Terms on one occasion will not be deemed a waiver of any other provision or of such provision on any other occasion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">15. Export Control</h2>
              <p className="text-foreground mb-4">
                You may not use, export, import, or transfer the Services except as authorized by U.S. law, the laws of the jurisdiction in which you obtained the Services, and any other applicable laws. In particular, but without limitation, the Services may not be exported or re-exported (a) into any United States embargoed countries, or (b) to anyone on the U.S. Treasury Department's list of Specially Designated Nationals or the U.S. Department of Commerce's Denied Person's List or Entity List. By using the Services, you represent and warrant that (i) you are not located in a country that is subject to a U.S. Government embargo, or that has been designated by the U.S. Government as a "terrorist supporting" country and (ii) you are not listed on any U.S. Government list of prohibited or restricted parties. You also will not use the Services for any purpose prohibited by U.S. law. You acknowledge and agree that products, services or technology provided by Voiceable are subject to the export control laws and regulations of the United States. You will comply with these laws and regulations and will not, without prior U.S. government authorization, export, re-export, or transfer Voiceable products, services or technology, either directly or indirectly, to any country in violation of such laws and regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">16. Notice</h2>
              <p className="text-foreground mb-4">
                All notices required or permitted under these Terms will be in writing, will reference these Terms, and will be deemed given: (i) when delivered personally; (ii) one business day after deposit with a nationally recognized express courier, with written confirmation of receipt; (iii) three business days after having been sent by registered or certified mail, return receipt requested, postage prepaid, or (iv) when sent by email, on the date the email was sent if sent during normal business hours of the receiving party, and on the next business day if sent after normal business hours of the receiving party. In the event that the last e-mail address you provided to Voiceable is not valid, or for any reason is not capable of delivering to you any notices required/permitted by these Terms, Voiceable's dispatch of the e-mail containing such notice will nonetheless constitute effective notice. You may give notice to Voiceable at the following email address: support@voiceable.ai
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">17. Assignment</h2>
              <p className="text-foreground">
                These Terms, and your rights and obligations hereunder, may not be assigned, subcontracted, delegated or otherwise transferred by you without Voiceable's prior written consent, and any attempted assignment, subcontract, delegation, or transfer in violation of the foregoing will be null and void. Voiceable may assign these Terms and any other right or obligation to a party without any consent or notification requirement to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">18. Force Majeure</h2>
              <p className="text-foreground">
                Voiceable will not be liable for any delay or failure to perform resulting from causes outside its reasonable control, including, but not limited to, acts of God, war, terrorism, riots, embargos, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes or shortages of transportation facilities, fuel, energy, labor or materials.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">19. Source code disclosures</h2>
              <p className="text-foreground mb-4">
                Voiceable incorporates open source software under multiple permissive licenses. This website, the Services, the App, and any Distributions of Voiceable's software may include certain third-party libraries licensed under the Mozilla Public License 2.0 (MPL 2.0). The source code of these libraries is available as required by the license. The following is a list of the MPL 2.0 licensed libraries included in Voiceable's software:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
                <li>github.com/go-sql-driver/mysql</li>
                <li>github.com/hashicorp/errwrap</li>
                <li>github.com/hashicorp/go-discover</li>
                <li>github.com/hashicorp/go-immutable-radix</li>
                <li>github.com/hashicorp/go-multierror</li>
                <li>github.com/hashicorp/go-sockaddr</li>
                <li>github.com/hashicorp/go-version</li>
                <li>github.com/hashicorp/golang-lru/simplelru</li>
                <li>github.com/hashicorp/logutils</li>
                <li>github.com/hashicorp/memberlist</li>
                <li>github.com/joyent/triton-go</li>
              </ul>
              <p className="text-foreground">
                The Mozilla Public License 2.0 permits you to use, modify, and distribute the code under the conditions of the license. A copy of the license is available at <a href="https://www.mozilla.org/en-US/MPL/2.0/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://www.mozilla.org/en-US/MPL/2.0/</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">20. Final Terms</h2>
              <p className="text-foreground">
                These Terms, along with any Voiceable ordering document such as master agreement, or as found on Voiceable's website, make up the final, entire, and exclusive agreement between you and Voiceable with respect to the subject matter hereof and supersede any prior agreements and discussions, both written and oral, with respect to such subject matter. No purchase order or other document issued by you in respect of our Services shall control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">21. Contact Us</h2>
              <p className="text-foreground">
                Voiceable welcomes comments, questions, concerns, or suggestions. Please send us any inquiries at support@voiceable.ai or find more information about us by visiting our Documentation.
              </p>
            </section>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

