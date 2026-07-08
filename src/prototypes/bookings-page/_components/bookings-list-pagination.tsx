"use client";

import { Button } from "@calcom/ui/components/button";
import { ButtonGroup } from "@calcom/ui/components/buttonGroup";
import { PrototypeComponent } from "proto-plugin";

type BookingsListPaginationProps = {
  totalItems: number;
};

export function BookingsListPagination({ totalItems }: BookingsListPaginationProps) {
  return (
    <PrototypeComponent
      id="bookings-list-pagination"
      className="flex items-center justify-between space-x-2"
    >
      <div className="flex items-center space-x-2">
        <div className="border-subtle bg-default text-default flex h-8 min-w-14 items-center justify-center rounded-md border px-2 text-sm">
          10
        </div>
        <span className="text-default text-sm">rows per page</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-default text-sm">
          1-{totalItems} of {totalItems}
        </span>
        <ButtonGroup containerProps={{ className: "space-x-1.5" }}>
          <Button
            variant="icon"
            StartIcon="arrow-left"
            disabled
            color="secondary"
            size="sm"
            aria-label="Previous page"
          />
          <Button
            variant="icon"
            StartIcon="arrow-right"
            disabled
            color="secondary"
            size="sm"
            aria-label="Next page"
          />
        </ButtonGroup>
      </div>
    </PrototypeComponent>
  );
}
