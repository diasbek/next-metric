import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";
import { TransitionLink } from "@/components/atoms/TransitionLink";

export type ButtonVariant =
  | "primary"
  | "dark"
  | "outline"
  | "outlineAccent"
  | "onAccent";

export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "metric-cta--primary metric-cta--skew",
  dark: "metric-cta--dark-fill metric-cta--skew-dark",
  outline: "metric-cta--outline-dark metric-cta--skew-outline",
  outlineAccent: "metric-cta--outline",
  onAccent: "metric-cta--on-accent",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "metric-cta--sm",
  md: "metric-cta--md",
  lg: "metric-cta--lg",
};

type SharedProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonAsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
    as?: "button";
  };

type ButtonAsSpan = SharedProps &
  Omit<ComponentPropsWithoutRef<"span">, "className" | "children"> & {
    href?: undefined;
    as: "span";
  };

type ButtonAsLink = SharedProps &
  Omit<
    ComponentPropsWithoutRef<typeof TransitionLink>,
    "className" | "children"
  > & {
    href: ComponentPropsWithoutRef<typeof TransitionLink>["href"];
    as?: never;
  };

export type ButtonProps = ButtonAsButton | ButtonAsSpan | ButtonAsLink;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cx("metric-cta", VARIANT_CLASS[variant], SIZE_CLASS[size], className);
}

export function Button(props: ButtonProps) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const classes = buttonClassName(variant, size, props.className);
  const label = <span className="metric-cta__label">{props.children}</span>;

  if ("href" in props && props.href != null) {
    const { children, variant: _v, size: _s, className: _c, href, ...rest } =
      props;
    return (
      <TransitionLink href={href} className={classes} {...rest}>
        {label}
      </TransitionLink>
    );
  }

  if (props.as === "span") {
    const { children, variant: _v, size: _s, className: _c, as: _as, ...rest } =
      props;
    return (
      <span className={classes} {...rest}>
        {label}
      </span>
    );
  }

  const {
    children,
    variant: _v,
    size: _s,
    className: _c,
    as: _as,
    type = "button",
    ...rest
  } = props;

  return (
    <button type={type} className={classes} {...rest}>
      {label}
    </button>
  );
}
