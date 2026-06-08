export const spacing = {
    bento: 16,
    pageX: 20,
    pageTop: 60,
    tabBottom: 32,
} as const;

export const radius = {
    bentoLg: 24,
    bentoSm: 16,
    card: 16,
    input: 12,
    pill: 999,
} as const;

export const typography = {
    title: {
        fontSize: 30,
        fontWeight: "900",
        letterSpacing: -0.5,
    },
    heading: {
        fontSize: 24,
        fontWeight: "900",
        letterSpacing: -0.3,
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
    },
    caption: {
        fontSize: 12,
        lineHeight: 16,
    },
} as const;

export const shadow = {
    bento: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.08,
        shadowRadius: 32,
        elevation: 8,
    },
} as const;

export const BENTO_GAP = spacing.bento;
export const BENTO_RADIUS_LG = radius.bentoLg;
export const BENTO_RADIUS_SM = radius.bentoSm;
