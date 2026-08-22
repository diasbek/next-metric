import Image from "next/image";
import { PageContainer, SectionTitle } from "@/components/atoms";
import { OfficeMap } from "@/components/molecules/OfficeMapLazy";
import type { LocalePageProps } from "@/i18n/props";

export function ContactsPageSection({ content }: LocalePageProps) {
  const { site, ui } = content;

  return (
    <div className="contacts-page bg-black pb-16 pt-28 md:pb-24">
      <PageContainer>
        <section className="contacts-page__layout" data-scroll-section>
          <SectionTitle
            as="h1"
            split
            data-flip-id="page-title"
            className="contacts-page__title"
          >
            {ui.contactUs}
          </SectionTitle>

          <div className="contacts-page__intro">
            <p className="contacts-page__subtitle text-body-lg text-white">
              {ui.respondWithinHour}
            </p>

            <div className="contacts-page__links">
              <div className="contacts-page__link-item">
                <p className="contacts-page__link-label">Upwork</p>
                <a
                  href={site.social.upwork}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contacts-page__link-value"
                >
                  {ui.instagramAction}
                </a>
              </div>

              <div className="contacts-page__link-item">
                <p className="contacts-page__link-label">Facebook</p>
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contacts-page__link-value"
                >
                  {ui.instagramAction}
                </a>
              </div>

              <div className="contacts-page__link-item">
                <p className="contacts-page__link-label">Instagram</p>
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contacts-page__link-value"
                >
                  {ui.instagramAction}
                </a>
              </div>

              {site.social.linkedin ? (
                <div className="contacts-page__link-item">
                  <p className="contacts-page__link-label">LinkedIn</p>
                  <a
                    href={site.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contacts-page__link-value"
                  >
                    {ui.instagramAction}
                  </a>
                </div>
              ) : null}

              <div className="contacts-page__link-item">
                <p className="contacts-page__link-label">{ui.phoneLabel}</p>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="contacts-page__link-value"
                >
                  {site.phone}
                </a>
              </div>
            </div>
          </div>

          <OfficeMap className="contacts-page__map" ariaLabel={ui.mapAlt} />

          <div className="contacts-page__address">
            <p className="contacts-page__link-label">{ui.addressLabel}</p>
            <address className="contacts-page__address-value not-italic">
              {site.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          <div className="contacts-page__downloads">
            <a
              href={site.files.presentation}
              className="contacts-page__card contacts-page__card--presentation"
            >
              <Image
                src="/images/contacts/document-pdf.svg"
                alt=""
                width={32}
                height={32}
                aria-hidden
              />
              <div className="contacts-page__card-copy">
                <p className="contacts-page__card-title">
                  {ui.downloadPresentation}
                </p>
                <p className="contacts-page__card-text">{ui.presentationHint}</p>
              </div>
            </a>

            <a
              href={site.files.brief}
              className="contacts-page__card contacts-page__card--brief"
            >
              <Image
                src="/images/contacts/document-attachment.svg"
                alt=""
                width={32}
                height={32}
                aria-hidden
              />
              <div className="contacts-page__card-copy">
                <p className="contacts-page__card-title">{ui.downloadBrief}</p>
                <p className="contacts-page__card-text">{ui.briefHint}</p>
              </div>
            </a>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
