import { MediaImage } from "@/components/atoms/MediaImage";
import type { ProjectReview } from "@/data/projects";

type Props = {
  reviews: ProjectReview[];
  /** Case / project title shown on each review card. */
  caseTitle: string;
  /** Fallback when a review has no personImage (usually project cover). */
  fallbackImage: string;
  fallbackAuthor: string;
};

function norm(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function CaseReviewsCarousel({
  reviews,
  caseTitle,
  fallbackImage,
  fallbackAuthor,
}: Props) {
  const title = caseTitle.trim();
  const titleKey = title ? norm(title) : "";

  return (
    <div className="metric-case__reviews">
      {reviews.map((review, index) => {
        const name = (review.author?.trim() || fallbackAuthor).trim();
        const role = review.role?.trim() ?? "";
        const avatar = review.personImage?.trim() || fallbackImage;
        const nameKey = name ? norm(name) : "";
        const roleKey = role ? norm(role) : "";

        // Case title once at top; skip it when it only repeats the author.
        const showCase = Boolean(titleKey) && titleKey !== nameKey;
        // Role only when it adds something beyond case title / author.
        const showRole =
          Boolean(roleKey) && roleKey !== titleKey && roleKey !== nameKey;

        return (
          <article
            key={review.id || `${index}-${name}`}
            className="metric-case__review"
          >
            {showCase ? (
              <p className="metric-case__review-case">{title}</p>
            ) : null}
            <div className="metric-case__review-author">
              <div className="metric-case__review-avatar">
                {avatar ? (
                  <MediaImage
                    src={avatar}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : null}
              </div>
              <div>
                {name ? (
                  <p className="metric-case__review-name">{name}</p>
                ) : null}
                {showRole ? (
                  <p className="metric-case__review-role">{role}</p>
                ) : null}
              </div>
            </div>
            {review.quote ? (
              <p className="metric-case__review-quote">{review.quote}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
