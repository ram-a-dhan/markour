import Image from "next/image";
import { Button, Card } from "@mantine/core";
import { GOOGLE_AUTH_API_PATH } from "@/src/constants/url";
import { GoogleLogoIcon, GooglePlayLogoIcon } from "@phosphor-icons/react";
import MarkourLogo from "@/public/markour.svg";

export default function LoginCard() {
  return (
    <Card shadow="sm" withBorder className="items-center gap-8">
      <div className="m-auto flex flex-col gap-2">
        <Image
          src={MarkourLogo}
          loading="eager"
          alt="Markour Logo"
          width={128}
          height={128}
        />

        <h1 className="text-center text-2xl font-bold leading-none flex justify-between">
          <span>M</span>
          <span>a</span>
          <span>r</span>
          <span>k</span>
          <span>o</span>
          <span>u</span>
          <span>r</span>
        </h1>
      </div>

      <p className="text-center text-base leading-none">
        Agile & Flexible Markdown Notes
      </p>

      <div className="w-full flex flex-col gap-4">
        <a href={GOOGLE_AUTH_API_PATH}>
          <Button fullWidth leftSection={<GoogleLogoIcon />}>
            Sign In With Google
          </Button>
        </a>

        {/* NOTE: coming soon */}
        {/* <a href={"#"}>
          <Button fullWidth color="green" leftSection={<GooglePlayLogoIcon />}>
            Download Android App
          </Button>
        </a> */}
      </div>
    </Card>
  );
}
