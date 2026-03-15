package vn.edu.fpt.util.enums;

public enum ImageCategory {
    MENU_ITEM("menu-items"),
    SET_MENU("set-menus"),
    HALL("halls");

    private final String prefix;

    ImageCategory(String prefix) {
        this.prefix = prefix;
    }

    public String prefix() {
        return prefix;
    }
}
