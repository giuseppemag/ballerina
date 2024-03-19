import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { Button, CSSObject, Stack, styled } from "@mui/material";

import { getBasePath } from "../../../../../utils/getBasePath";

const HeaderLogo = styled("img")(() => {
  const styles: CSSObject = {
    height: 100,
    minHeight: 60,
    marginBottom: 42,
  };
  return styles;
});

const Error = styled("div")(() => {
  const styles: CSSObject = {
    fontFamily: "Roboto",
    fontSize: "11px",
    lineHeight: "16px",
    position: "relative",
    backgroundColor: "#F5F5F5",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    boxSizing: "border-box",
    flexDirection: "column",
    width: "692px",
    borderRadius: 8,
    overflowY: "auto",
    padding: "24px 32px",
    maxHeight: "240px",
  };
  return styles;
});
const Explanation = styled("p")(() => {
  const styles: CSSObject = {
    fontFamily: "Roboto",
    position: "relative",
    width: "510px",
    margin: "0 0 42px 0",
    fontSize: 14,
    lineHeight: "165%",
    textAlign: "center",
    color: "#7B7B7B",
    letterSpacing: "-0.63px",
  };
  return styles;
});

const FallbackColumn = styled("div")(() => {
  const styles: CSSObject = {
    position: "relative",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
  };
  return styles;
});

export function ErrorBoundryFallback({ error }: { error: Error }) {
  const errors = [
    "Failed to fetch dynamically imported module",
    "error loading dynamically imported module",
  ];

  if (errors.some((e) => error.message.includes(e))) {
    window.location.assign(window.location.href);
    return null;
  }

  return (
    <FallbackColumn>
      <HeaderLogo src={getBasePath("logo_short.png")} />

      <Stack
        direction={"row"}
        style={{ marginBottom: 42, alignItems: "center" }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 32, marginRight: "8px" }} />
        <h1 style={{ margin: 0, fontSize: 24 }}>Oops, an error occurred!</h1>
      </Stack>

      <Explanation>
        Please refresh the page. If the problem persists, kindly click the
        <strong> Copy Error Details </strong>
        button below and send it to us at <span>&#8203;</span>
        <strong>
          <a style={{ color: "#2196F3" }} href={composeEmail(true, error)}>
            support@blp-digital.com
          </a>
        </strong>
        , along with a brief description of your actions when the error
        occurred.
        <br />
        <br />
        <strong>We appreciate your patience and understanding.</strong>
      </Explanation>

      <Stack direction={"row"} spacing={"42px"} style={{ marginBottom: 42 }}>
        <Button
          size="small"
          onClick={() => window.location.reload()}
          variant="outlined"
          style={{ color: "#2196F3" }}
          startIcon={<RotateLeftIcon />}
        >
          RELOAD
        </Button>
        <Button
          size="small"
          variant="contained"
          style={{ backgroundColor: "#2196F3" }}
          startIcon={<ContentCopyIcon />}
          onClick={() => {
            navigator.clipboard.writeText(
              decodeURIComponent(composeEmail(false, error))
            );
          }}
        >
          COPY ERROR DeTAILS
        </Button>
      </Stack>
      <Stack>
        <Error>{error.stack?.toString()}</Error>
      </Stack>
    </FallbackColumn>
  );
}

function detectOS() {
  let OSName = "Unknown OS";
  if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
  if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
  if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
  if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";
  return "Your OS: " + OSName;
}

function detectBrowser() {
  const ua = navigator.userAgent;
  let tem;
  let M =
    ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) ||
    [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return "IE " + (tem[1] || "");
  }
  if (M[1] === "Chrome") {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return tem.slice(1).join(" ").replace("OPR", "Opera");
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
  return M.join(" ");
}

function composeEmail(mailTo: boolean, error: Error) {
  if (mailTo) {
    return `
mailto:support@blp-digital.com?subject=[BLP Digital] Error Report&body=
Hello, I faced an issue in BLP Digital. Below, I've added some details: %0D%0A%0D%0A

Description:%0D%0A
[Briefly describe here what you were doing.] %0D%0A %0D%0A %0D%0A %0D%0A %0D%0A %0D%0A

Thank you. %0D%0A %0D%0A %0D%0A
=========================================== %0D%0A
⚠️ DO NOT MODIFY ANYTHING BELOW THIS LINE ⚠️ %0D%0A
=========================================== %0D%0A %0D%0A


URL: %0D%0A ${encodeURIComponent(document.location.href)} %0D%0A%0D%0A

Time: %0D%0A ${new Date()} %0D%0A%0D%0A

OS: %0D%0A ${detectOS()} %0D%0A%0D%0A

Browser: %0D%0A ${detectBrowser()} %0D%0A%0D%0A

Stack Trace: %0D%0A ${encodeURIComponent(error.stack ?? error.message)} 
  `;
  } else {
    return `Hello, I faced an issue in BLP Digital. Below, I've added some details:

Description:
[Briefly describe here what you were doing.] 





Thank you.


=========================================== 
⚠️ DO NOT MODIFY ANYTHING BELOW THIS LINE ⚠️ 
===========================================

URL:
${encodeURIComponent(document.location.href)}

Time: 
${new Date()}

OS: 
${detectOS()}

Browser: 
${detectBrowser()}

Stack Trace: 
${error.stack} 

  `;
  }
}
