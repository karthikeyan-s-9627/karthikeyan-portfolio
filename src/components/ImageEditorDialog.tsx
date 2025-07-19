"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader2, Crop, ZoomIn, ZoomOut, Trash2 } from "lucide-react";
import { showError } from "@/utils/toast";

interface ImageEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (croppedImageBlob: Blob) => void;
  onDelete: () => void;
  isSaving: boolean;
}

const ImageEditorDialog: React.FC<ImageEditorDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  onDelete,
  isSaving,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined); // undefined for free crop
  const [imageLoading, setImageLoading] = useState(true);
  const [objectFit, setObjectFit] = useState<'contain' | 'cover' | 'none'>('contain');

  React.useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setAspectRatio(undefined);
      setImageLoading(true);
      setObjectFit('contain');
    }
  }, [isOpen]);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous"); // Needed for cross-origin images
      image.src = url;
    });

  const getCroppedImage = useCallback(async () => {
    if (!imageUrl || !croppedAreaPixels) {
      showError("No image or crop area defined.");
      return;
    }

    try {
      const image = await createImage(imageUrl);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        showError("Could not get canvas context.");
        return;
      }

      const { x, y, width, height } = croppedAreaPixels;

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
      );

      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg"); // You can choose the output format
      });
    } catch (e: any) {
      showError(`Failed to crop image: ${e.message}`);
      return null;
    }
  }, [imageUrl, croppedAreaPixels]);

  const handleSave = async () => {
    const croppedBlob = await getCroppedImage();
    if (croppedBlob) {
      onSave(croppedBlob);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>
        <div className="flex-grow relative bg-muted/20 rounded-md overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={handleImageLoad}
            objectFit={objectFit}
            showGrid={true}
            cropShape="rect" // Can be 'rect' or 'round'
            classes={{
              containerClassName: "bg-transparent",
              mediaClassName: "object-contain",
              cropAreaClassName: "border-2 border-primary/50",
            }}
          />
        </div>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="zoom-slider" className="w-16 flex-shrink-0">
              <ZoomIn className="inline-block mr-2 h-4 w-4" /> Zoom
            </Label>
            <Slider
              id="zoom-slider"
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(val) => setZoom(val[0])}
              className="flex-grow"
            />
            <ZoomOut className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-4">
            <Label className="w-16 flex-shrink-0">
              <Crop className="inline-block mr-2 h-4 w-4" /> Fit
            </Label>
            <div className="flex gap-2">
              <Button
                variant={objectFit === 'contain' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setObjectFit('contain')}
              >
                Fit
              </Button>
              <Button
                variant={objectFit === 'cover' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setObjectFit('cover')}
              >
                Cover
              </Button>
              <Button
                variant={objectFit === 'none' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setObjectFit('none')}
              >
                Original
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between items-center">
          <Button variant="destructive" onClick={onDelete} disabled={isSaving}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Image
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save Cropped Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditorDialog;