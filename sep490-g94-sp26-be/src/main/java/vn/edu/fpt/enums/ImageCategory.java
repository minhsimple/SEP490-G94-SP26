package vn.edu.fpt.enums;

public enum ImageCategory {
    MENU_ITEM("menu-items"),
    SERVICE("services");

    private final String prefix;

    ImageCategory(String prefix) {
        this.prefix = prefix;
    }

    public String prefix() {
        return prefix;
    }
}
