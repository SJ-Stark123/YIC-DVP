'use client';
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { GalleryItem } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";


const GallerySection = () => {
    const firestore = useFirestore();
    const galleryQuery = useMemoFirebase(() => firestore ? collection(firestore, 'gallery_items') : null, [firestore]);
    const { data: galleryImages, isLoading } = useCollection<GalleryItem>(galleryQuery);


  return (
    <section id="gallery" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Innovation <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Gallery</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            A glimpse into our world of creation, collaboration, and discovery.
          </p>
        </div>

        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className={`h-64 w-full ${i % 2 === 0 ? 'h-80' : 'h-64'}`} />
            ))
          ) : (
            galleryImages?.map((image) => (
                <div key={image.id} className="break-inside-avoid">
                <Card className="overflow-hidden group relative bg-card/50 backdrop-blur-sm border-primary/20">
                    <Image
                    src={image.imageUrl}
                    alt={image.title}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <p className="text-white text-center font-semibold">{image.title}</p>
                    </div>
                </Card>
                </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
    