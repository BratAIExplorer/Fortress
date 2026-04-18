import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Trash2, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Fortress Intelligence",
  description: "Learn how Fortress Intelligence protects and uses your data",
};

export default function PrivacyPage() {
  const lastUpdated = "April 18, 2026";

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Your Privacy Matters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At Fortress Intelligence, we take your privacy seriously. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform.
              </p>
              <p className="text-sm text-muted-foreground">
                By accessing or using Fortress Intelligence, you agree to the terms of this Privacy Policy. If you disagree with our practices, please do not use our platform.
              </p>
            </CardContent>
          </Card>

          {/* What We Collect */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>What Information We Collect</CardTitle>
              <CardDescription>The data you provide and what we learn from your usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Account Information</h4>
                  <p className="text-sm text-muted-foreground">
                    When you register, we collect your email address and password (hashed for security). We may also collect your name if you choose to provide it.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Behavioral Data</h4>
                  <p className="text-sm text-muted-foreground">
                    We track which features you use, which stocks you research, which screeners you run, and how much time you spend on each page. This helps us understand which features provide value and where to focus development.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Feedback & Communications</h4>
                  <p className="text-sm text-muted-foreground">
                    When you submit feedback, bug reports, or suggestions through our platform, we store this information in our database. We may email you to follow up on your feedback.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Device & Connection Data</h4>
                  <p className="text-sm text-muted-foreground">
                    We may automatically collect information about your device (browser type, operating system) and connection (IP address). This helps us troubleshoot issues and improve performance.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Optional Communications</h4>
                  <p className="text-sm text-muted-foreground">
                    If you opt in, we'll send you emails about new features, product updates, and platform alerts. You can change this preference anytime in your account settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Data */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
              <CardDescription>Our purpose for collecting and processing your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">Providing and improving our platform and features</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">Understanding which features provide the most value</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">Responding to your feedback and support requests</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">Sending important security updates and account notifications</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">Detecting and preventing fraud or security issues</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">Complying with legal obligations</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Store Your Data */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Data Storage & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Storage Location</h4>
                  <p className="text-sm text-muted-foreground">
                    Your data is stored in a secure PostgreSQL database managed with enterprise-grade infrastructure. All data is encrypted in transit using HTTPS.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Password Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Your password is hashed using bcrypt (with 12 rounds of salt) before storage. We never store your plain-text password.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Access Control</h4>
                  <p className="text-sm text-muted-foreground">
                    Your data is only accessible to Fortress Intelligence team members who need it to provide support and improve the service. We do not sell or share your data with third parties.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Third-Party Services</h4>
                  <p className="text-sm text-muted-foreground">
                    We use third-party services (such as email providers) to deliver certain functionality. These services are bound by confidentiality agreements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Account Data</h4>
                  <p className="text-sm text-muted-foreground">
                    We retain your account information (email, name) as long as your account is active. When you delete your account, we securely delete this information.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Behavioral Data</h4>
                  <p className="text-sm text-muted-foreground">
                    We retain anonymized behavioral data for 2 years to help with product development. Personally identifiable behavioral information is retained for 1 year.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Feedback & Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Feedback and bug reports are retained for 2 years to track patterns and improvements. You can request deletion of specific feedback at any time.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Consent Records</h4>
                  <p className="text-sm text-muted-foreground">
                    We maintain records of your privacy consent decisions for 3 years for compliance purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
              <CardDescription>You have control over your personal data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Access Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    You can request a copy of all personal data we hold about you. Contact us at support@fortressintelligence.space.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Correct Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    You can update your account information anytime in your account settings.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Delete Your Account</h4>
                  <p className="text-sm text-muted-foreground">
                    You can delete your account anytime, which will remove all your personal data from our active systems.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Withdraw Consent</h4>
                  <p className="text-sm text-muted-foreground">
                    You can update your privacy consent preferences anytime in account settings, including opting out of behavioral tracking or email notifications.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    You can request a machine-readable export of your data. Contact support@fortressintelligence.space.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Questions & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                If you have any questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Email:</span> support@fortressintelligence.space
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Privacy Contact:</span> privacy@fortressintelligence.space
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
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
