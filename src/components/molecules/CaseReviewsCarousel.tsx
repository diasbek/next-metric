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

export function CaseReviewsCarousel({
  reviews,
  caseTitle,
  fallbackImage,
  fallbackAuthor,
}: Props) {
  const title = caseTitle.trim();

  return (
    <div className="metric-case__reviews">
      {reviews.map((review, index) => {
        const name = review.author?.trim() || fallbackAuthor;
        const avatar = review.personImage?.trim() || fallbackImage;
        return (
          <article
            key={review.id || `${index}-${name}`}
            className="metric-case__review"
          >
            {title ? (
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
                <p className="metric-case__review-name">{name}</p>
                {review.role ? (
                  <p className="metric-case__review-role">{review.role}</p>
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
