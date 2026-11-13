# src/business: business.joinleland.com (pre-launch)

Read `README.md` in this folder first: branch flow, preview links, ownership.

- Work branches come off `business-site` and PRs target `business-site`, never `main`.
- Copy lives in `src/business/content/<page>.js`; components import it. Don't hardcode words in JSX.
- Class prefixes: `biz-` (pages), `vk-`/`v*-` (variations). Don't edit shared leland.ai CSS or components unless the task is about them.
- Placeholders stay in `[brackets]`. Never invent quotes or results for real companies.
- Verify in a browser at 1440 and 375 before calling anything done; `npm run check` and `npm run build` must pass.
