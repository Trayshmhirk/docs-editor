import { LinkPlugin as LexicalLinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import * as React from "react";

import { validateUrl } from "@/lib/utils";

type Props = {
  hasLinkAttributes?: boolean;
};

export default function LinkPlugin({
  hasLinkAttributes = false,
}: Props): JSX.Element {
  return (
    <LexicalLinkPlugin
      validateUrl={validateUrl}
      attributes={
        hasLinkAttributes
          ? {
              rel: "noopener noreferrer",
              target: "_blank",
            }
          : undefined
      }
    />
  );
}
