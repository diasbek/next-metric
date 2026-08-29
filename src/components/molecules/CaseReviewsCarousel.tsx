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

/** Long role text is almost certainly a misplaced quote. */
function looksLikeQuoteBody(text: string): boolean {
  const t = text.trim();
  return t.length > 80 || /[.!?]/.test(t);
}

function resolveReviewCopy(
  review: ProjectReview,
  caseTitle: string,
  fallbackAuthor: string,
): { name: string; role: string; quote: string; showCase: boolean } {
  const title = caseTitle.trim();
  const titleKey = title ? norm(title) : "";
  const name = (review.author?.trim() || fallbackAuthor).trim();
  const nameKey = name ? norm(name) : "";

  let quote = review.quote?.trim() ?? "";
  let role = review.role?.trim() ?? "";

  // CMS sometimes stores the case title in `quote` and the review in `role`.
  if (titleKey && norm(quote) === titleKey && looksLikeQuoteBody(role)) {
    quote = role;
    role = "";
  } else if (!quote && looksLikeQuoteBody(role)) {
    quote = role;
    role = "";
  }

  if (titleKey && norm(quote) === titleKey) quote = "";
  if (nameKey && norm(quote) === nameKey) quote = "";

  if (titleKey && norm(role) === titleKey) role = "";
  if (nameKey && norm(role) === nameKey) role = "";
  if (quote && norm(role) === norm(quote)) role = "";

  const showCase =
    Boolean(titleKey) &&
    titleKey !== nameKey &&
    (!quote || titleKey !== norm(quote));

  return { name, role, quote, showCase };
}

export function CaseReviewsCarousel({
  reviews,
  caseTitle,
  fallbackImage,
  fallbackAuthor,
}: Props) {
  return (
    <div className="metric-case__reviews">
      {reviews.map((review, index) => {
        const { name, role, quote, showCase } = resolveReviewCopy(
          review,
          caseTitle,
          fallbackAuthor,
        );
        const avatar = review.personImage?.trim() || fallbackImage;
        const title = caseTitle.trim();

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
                {role ? (
                  <p className="metric-case__review-role">{role}</p>
                ) : null}
              </div>
            </div>
            {quote ? (
              <p className="metric-case__review-quote">{quote}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
