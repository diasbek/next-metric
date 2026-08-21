export default function Loading() {
  return (
    <div className="site-route-loading" aria-busy="true" aria-label="Loading">
      <div className="site-route-loading__inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="site-route-loading__logo"
          src="/images/metric/logo/metric-logo.svg"
          alt=""
          width={160}
          height={36}
        />
        <span className="site-route-loading__spinner" aria-hidden="true" />
      </div>
    </div>
  );
}
