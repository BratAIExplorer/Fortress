import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lock, Gavel, Ban } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Fortress Intelligence",
  description: "Legal terms and conditions for using Fortress Intelligence",
};

export default function TermsPage() {
  const lastUpdated = "April 18, 2026";

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
              <Gavel className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-8">
          {/* Legal Notice */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                Important Legal Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-amber-700">
                These Terms of Service govern your use of Fortress Intelligence. By accessing or using this platform, you agree to be bound by these terms. If you do not agree, you may not use our service.
              </p>
              <p className="text-sm text-amber-700">
                <strong>⚠️ Not Financial Advice:</strong> Fortress Intelligence provides analysis and research tools only. Nothing on this platform constitutes financial advice, investment recommendations, or advice to buy or sell securities. Investment analysis is educational in nature. Consult with a qualified financial advisor before making investment decisions.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-primary" />
                Acceptable Use Policy
              </CardTitle>
              <CardDescription>What you can and cannot do on Fortress Intelligence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">You agree NOT to:</h4>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-3 text-sm">
                    <span className="text-destructive">✗</span>
                    <span>Use bots, scrapers, or automated tools to access the platform</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="text-destructive">✗</span>
                    <span>Attempt to bypass security measures or access unauthorized data</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="text-destructive">✗</span>
                    <span>Share your account credentials or allow others to use your account</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="text-destructive">✗</span>
                    <span>Submit misleading, abusive, or illegal content</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="text-destructive">✗</span>
                    <span>Attempt to disrupt or interfere with platform availability</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="text-destructive">✗</span>
                    <span>Reverse engineer, decompile, or attempt to access source code</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="text-destructive">✗</span>
                    <span>Scrape or copy large amounts of data from the platform</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="text-destructive">✗</span>
                    <span>Use the platform for illegal or unethical purposes</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Intellectual Property Rights</CardTitle>
              <CardDescription>Ownership of content and materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Platform Content</h4>
                  <p className="text-sm text-muted-foreground">
                    All content on Fortress Intelligence, including text, graphics, logos, images, and software, is the property of Fortress Intelligence or its content suppliers. You may not copy, reproduce, or distribute this content without explicit permission.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Your Content</h4>
                  <p className="text-sm text-muted-foreground">
                    You retain ownership of any feedback, suggestions, or data you submit to Fortress Intelligence. By submitting content, you grant us a non-exclusive, royalty-free license to use, reproduce, and display your content for improving our platform.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">DMCA Compliance</h4>
                  <p className="text-sm text-muted-foreground">
                    If you believe your intellectual property rights have been violated, please contact us at legal@fortressintelligence.space with a detailed description of the infringement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitations & Disclaimers */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Limitations of Liability
              </CardTitle>
              <CardDescription>What we are and aren't responsible for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Disclaimer of Warranties</h4>
                  <p className="text-sm text-muted-foreground">
                    Fortress Intelligence is provided "as is" without warranties of any kind. We do not guarantee that the platform will be error-free, uninterrupted, or free from viruses or harmful code.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">No Liability for Losses</h4>
                  <p className="text-sm text-muted-foreground">
                    To the fullest extent permitted by law, Fortress Intelligence shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, even if we've been advised of the possibility of such damages.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Investment Risk</h4>
                  <p className="text-sm text-muted-foreground">
                    All investments carry risk, including the potential loss of principal. Past performance does not guarantee future results. You are solely responsible for your investment decisions.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Data Accuracy</h4>
                  <p className="text-sm text-muted-foreground">
                    While we strive for accuracy, we do not guarantee that all data or analysis is completely accurate or up-to-date. Market data may be delayed or subject to errors from source feeds.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account & Termination */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Account Management & Termination</CardTitle>
              <CardDescription>Account policies and platform access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Account Responsibility</h4>
                  <p className="text-sm text-muted-foreground">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized access.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Account Termination</h4>
                  <p className="text-sm text-muted-foreground">
                    Fortress Intelligence may terminate or suspend your account if you violate these Terms of Service, engage in illegal activity, or violate our Acceptable Use Policy. You may delete your account anytime from settings.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Dispute Resolution</h4>
                  <p className="text-sm text-muted-foreground">
                    If you have a dispute with Fortress Intelligence, contact us at support@fortressintelligence.space. We'll work to resolve the issue. If unresolved, disputes will be handled through binding arbitration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
              <CardDescription>How we update these terms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Fortress Intelligence reserves the right to modify these Terms of Service at any time. We will notify users of material changes via email or prominent notice on the platform. Your continued use of the platform constitutes acceptance of updated terms.
              </p>
            </CardContent>
          </Card>

          {/* Security & Data Protection */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Password Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Passwords are hashed using bcrypt before storage. We recommend using strong, unique passwords and changing them regularly.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Encryption</h4>
                  <p className="text-sm text-muted-foreground">
                    All data in transit is encrypted using HTTPS. Your account data is securely stored and access-controlled.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Privacy Compliance</h4>
                  <p className="text-sm text-muted-foreground">
                    Fortress Intelligence complies with privacy laws and regulations. See our Privacy Policy for details on data handling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Questions About These Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Email:</span> support@fortressintelligence.space
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Legal Inquiries:</span> legal@fortressintelligence.space
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/register" className="text-primary hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
