import { BottomSheetModal } from "@/components/ui/BottomSheetModal";

type SheetProps = React.ComponentProps<typeof BottomSheetModal>;

function Sheet(props: SheetProps) {
    return <BottomSheetModal {...props} />;
}

export { Sheet, type SheetProps };
