"use client";

import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { PageBreadcrumb as PageBreadcrumbType } from "@/lib/actions/pages";
import { Fragment } from "react";

interface PageBreadcrumbsProps {
  orgName: string;
  spaceName: string;
  spaceId: string;
  breadcrumbs: PageBreadcrumbType[];
}

export function PageBreadcrumbs({
  spaceName,
  spaceId,
  breadcrumbs,
}: PageBreadcrumbsProps) {
  const router = useRouter();

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            className="cursor-pointer"
            onClick={() => router.push(`/${spaceId}`)}
          >
            {spaceName}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((bc, i) => (
          <Fragment key={bc.id}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {i === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{bc.title || "Untitled"}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => router.push(`/${spaceId}/${bc.id}`)}
                >
                  {bc.title || "Untitled"}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
