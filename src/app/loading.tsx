export default function Loading() {
  return (
    <div className="site-route-loading" aria-busy="true" aria-label="Loading">
      <div className="site-route-loading__inner">
        <div className="site-route-loading__logo-wrap" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="site-route-loading__logo site-route-loading__logo--gray"
            src="/images/metric/logo/metric-logo.svg"
            alt=""
            width={185}
            height={42}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="site-route-loading__logo site-route-loading__logo--color"
            src="/images/metric/logo/metric-logo.svg"
            alt=""
            width={185}
            height={42}
          />
        </div>
      </div>
    </div>
  );
}
