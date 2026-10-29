"use client";
import { CldUploadWidget } from "next-cloudinary";
import { saveImage } from "@/actions/save-image.action";

export function ImageUploader() {
  return (
    <CldUploadWidget
      signatureEndpoint="/api/sign-cloudinary-params"
      options={{ folder: "my-app", maxFileSize: 5_000_000 }}
      onSuccess={async (result) => {
        if (typeof result.info === "object") {
          await saveImage({
            publicId: result.info.public_id,
            url: result.info.secure_url,
            width: result.info.width,
            height: result.info.height,
          });
        }
      }}
    >
      {({ open }) => <button onClick={() => open()}>Upload Image</button>}
    </CldUploadWidget>
  );
}
