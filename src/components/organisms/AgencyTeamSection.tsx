import { Divider } from "@/components/atoms";
import { MediaImage } from "@/components/atoms/MediaImage";
import type { LocalePageProps } from "@/i18n/props";

export function AgencyTeamSection({ content }: LocalePageProps) {
  const { agency, ui } = content;

  return (
    <section className="agency-team">
      <Divider className="mb-0" />

      <div className="agency-team__head">
        <h2 className="agency-team__title text-h2 text-white">
          {ui.teamTitle}
        </h2>

        <article className="agency-team__director">
          <div className="agency-team__director-photo">
            <MediaImage
              src={agency.director.image}
              alt={agency.director.name}
              width={900}
              height={900}
              className="agency-team__photo-img"
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 560px"
              priority
            />
          </div>
          <p className="agency-team__director-role">{agency.director.role}</p>
          <p className="agency-team__director-name">{agency.director.name}</p>
        </article>
      </div>

      <div className="agency-team__grid">
        {agency.team.map((member, index) => (
          <article key={member.name} className="agency-team__member">
            <div className="agency-team__member-photo">
              <MediaImage
                src={member.image}
                alt={member.name}
                width={720}
                height={720}
                className="agency-team__photo-img"
                sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 360px"
                loading={index < 2 ? "eager" : "lazy"}
              />
            </div>
            <p className="agency-team__member-role">{member.role}</p>
            <p className="agency-team__member-name">{member.name}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
