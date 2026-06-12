import React from "react";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";

type SheetProps = React.ComponentProps<typeof BottomSheetModal>;

function Sheet({ sheetHeight = "85%", avoidKeyboard = false, ...props }: SheetProps) {
    return <BottomSheetModal {...props} sheetHeight={sheetHeight} avoidKeyboard={avoidKeyboard} />;
}

Sheet.displayName = "Sheet";

export { Sheet, type SheetProps };
