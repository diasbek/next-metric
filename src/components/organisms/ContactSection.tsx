import { Divider, PageContainer } from "@/components/atoms";
import { ContactForm } from "@/components/molecules/ContactForm";
import type { LocalePageProps } from "@/i18n/props";
import { getPublicCaptchaConfig } from "@/lib/cms/settings";

interface ContactSectionProps extends LocalePageProps {
  subtitle?: string;
  className?: string;
}

export async function ContactSection({
  locale,
  content,
  subtitle,
  className = "",
}: ContactSectionProps) {
  const { site, ui } = content;
  const captcha = await getPublicCaptchaConfig();
  const resolvedSubtitle = subtitle ?? ui.contactSubtitle;
  const [subtitleLine1, subtitleLine2] = resolvedSubtitle.split(" — ");

  return (
    <section
      id="contacts"
      className={`contact-section section-y bg-black ${className}`.trim()}
      data-scroll-section
    >
      <PageContainer>
        <Divider />
        <div className="contact-section__head section-split" data-reveal-group>
          <div>
            <h2 className="text-h1 text-white">{ui.oneStep}</h2>
            <h2 className="text-h1 text-white">{ui.strongBrand}</h2>
          </div>

          <p className="contact-section__subtitle text-body-lg text-white" data-reveal>
            {subtitleLine1}
            {subtitleLine2 && (
              <>
                <br />— {subtitleLine2}
              </>
            )}
          </p>
        </div>

        <div className="contact-section__body">
          <div className="contact-section__info" data-reveal>
            <div className="contact-section__info-block">
              <p>{ui.phoneLabel}</p>
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="transition-opacity hover:opacity-70"
              >
                {site.phone}
              </a>
            </div>

            <div className="contact-section__info-block">
              <p>{ui.addressLabel}</p>
              <address className="not-italic">
                {site.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          </div>

          <ContactForm ui={ui} locale={locale} captcha={captcha} />
        </div>
      </PageContainer>
    </section>
  );
}
