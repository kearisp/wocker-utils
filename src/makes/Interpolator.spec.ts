import {describe, it, expect} from "@jest/globals";
import {Interpolator} from "./Interpolator";

describe("Interpolator", () => {
    describe("pluralize", () => {
        const interpolator = new Interpolator();

        it("should select exact match rule {n}", () => {
            const template = "{0} none here|{1} only one here|[2,*] :value here";

            expect(interpolator.pluralize(template, 0)).toBe("none here");
            expect(interpolator.pluralize(template, 1)).toBe("only one here");
            expect(interpolator.pluralize(template, 2)).toBe(":value here");
        });

        it("should select range rule [a,b]", () => {
            const template = "{0} none|[1,5] a few|[6,*] many";

            expect(interpolator.pluralize(template, 1)).toBe("a few");
            expect(interpolator.pluralize(template, 3)).toBe("a few");
            expect(interpolator.pluralize(template, 5)).toBe("a few");
        });

        it("should select infinite range rule [a,*]", () => {
            const template = "{0} none|[1,*] some";

            expect(interpolator.pluralize(template, 1)).toBe("some");
            expect(interpolator.pluralize(template, 100)).toBe("some");
        });

        it("should return the first matching segment", () => {
            const template = "{0} zero|{0} also zero";

            expect(interpolator.pluralize(template, 0)).toBe("zero");
        });

        it("should return empty string if no match found", () => {
            const template = "{1} one|{2} two";

            expect(interpolator.pluralize(template, 0)).toBe("");
        });
    });

    describe("interpolate", () => {
        it("should replace variables with default normalizer", () => {
            const interpolator = new Interpolator();
            const template = "Hello $name (${fullName}), welcome to :place!";
            const params = {
                name: "John",
                fullName: "Johnathan",
                place: "Earth"
            };

            expect(interpolator.interpolate(template, params)).toBe("Hello John (Johnathan), welcome to :place!");
        });

        it("should use custom normalizer", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => `{{${k}}}`
            });
            const template = "Hello {{name}}!";

            expect(interpolator.interpolate(template, {name: "John"})).toBe("Hello John!");
        });

        it("should use multiple patterns from custom normalizer", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => [`:${k}`, `{{${k}}}`]
            });
            const template = "Hello :name and {{name}}!";

            expect(interpolator.interpolate(template, {name: "John"})).toBe("Hello John and John!");
        });

        it("should escape special characters in patterns", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => `$${k}`
            });
            const template = "Price is $price";

            expect(interpolator.interpolate(template, {price: "10"})).toBe("Price is 10");
        });

        describe("clearMissing: false (default)", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => `:${k}`,
                clearMissing: false
            });

            it("should keep missing variables in the text", () => {
                const template = "Hello :name, bye :age";

                expect(interpolator.interpolate(template, {name: "John"}))
                    .toBe("Hello John, bye :age");
            });

            it("should handle partial params", () => {
                const template = ":a :b :c";

                expect(interpolator.interpolate(template, {a: "1", c: "3"}))
                    .toBe("1 :b 3");
            });

            it("should handle empty params", () => {
                const template = ":a :b";

                expect(interpolator.interpolate(template, {}))
                    .toBe(":a :b");
            });
        });

        describe("clearMissing: true", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => `:${k}`,
                clearMissing: true
            });

            it("should replace single missing variable with empty string", () => {
                const template = "Hello :name, bye :age";

                expect(interpolator.interpolate(template, {name: "John"}))
                    .toBe("Hello John, bye ");
            });

            it("should replace multiple missing variables", () => {
                const template = ":a :b :c";

                expect(interpolator.interpolate(template, {a: "1"}))
                    .toBe("1  ");
            });

            it("should replace all missing variables", () => {
                const template = ":a :b :c";

                expect(interpolator.interpolate(template, {}))
                    .toBe("  ");
            });

            it("should handle mixed present and missing variables", () => {
                const template = "User :name (:id) status: :status";

                expect(interpolator.interpolate(template, {name: "John", status: "active"}))
                    .toBe("User John () status: active");
            });

            it("should handle repeated missing variables", () => {
                const template = ":a :a :b";

                expect(interpolator.interpolate(template, {b: "2"}))
                    .toBe("  2");
            });
        });

        describe("Edge cases and complex scenarios", () => {
            it("should handle repeated variables", () => {
                const interpolator = new Interpolator({ normalizer: (k) => `:${k}` });
                const template = ":a :a :b";

                expect(interpolator.interpolate(template, { a: "1", b: "2" }))
                    .toBe("1 1 2");
            });

            it("should handle multiple patterns via normalizer with clearMissing: true (partial due to implementation limitation)", () => {
                const interpolator = new Interpolator({
                    normalizer: (k) => [`:${k}`, `$${k}`],
                    clearMissing: true
                });
                const template = "Replace :a and $b and :c";

                expect(interpolator.interpolate(template, {a: "1"}))
                    .toBe("Replace 1 and  and ");
            });

            it("should replace undefined or null values with empty string", () => {
                const interpolator = new Interpolator({
                    normalizer: (k) => `:${k}`
                });
                const template = "Val: :val";

                expect(interpolator.interpolate(template, {val: undefined })).toBe("Val: ");
                expect(interpolator.interpolate(template, {val: null })).toBe("Val: ");
            });

            it("should not change template without variables", () => {
                const interpolator = new Interpolator({clearMissing: true});
                const template = "Plain text";

                expect(interpolator.interpolate(template, {a: "1"})).toBe("Plain text");
            });

            it("should ignore extra keys in params", () => {
                const interpolator = new Interpolator({normalizer: (k) => `:${k}`});
                const template = "Hello :name";

                expect(interpolator.interpolate(template, {name: "John", age: 30}))
                    .toBe("Hello John");
            });

            it("should handle special characters in values safely", () => {
                const interpolator = new Interpolator({ normalizer: (k) => `:${k}` });
                const template = "Search: :query";
                const specialValue = ".*+?^${}()|[ ]\\";

                expect(interpolator.interpolate(template, {query: specialValue}))
                    .toBe(`Search: ${specialValue}`);
            });

            it("should correctly handle pattern-like strings in values (no recursion)", () => {
                const interpolator = new Interpolator({normalizer: (k) => `:${k}`});
                const template = "Value is :val";

                expect(interpolator.interpolate(template, {val: ":other", other: "recursive"}))
                    .toBe("Value is :other");
            });
        });
    });

    describe("getVariables", () => {
        it("should extract variables with default normalizer", () => {
            const interpolator = new Interpolator();
            const template = "Hello $name, your id is ${id}. Welcome to $place!";
            
            expect(interpolator.getVariables(template)).toEqual(["name", "id", "place"]);
        });

        it("should return unique variable keys", () => {
            const interpolator = new Interpolator();
            const template = "$name $name ${name} $age";
            
            expect(interpolator.getVariables(template)).toEqual(["name", "age"]);
        });

        it("should handle multiple patterns from custom normalizer", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => [`:${k}`, `{{${k}}}`]
            });
            const template = "User :name has {{count}} notifications. Priority: :priority";

            expect(interpolator.getVariables(template)).toEqual(["name", "count", "priority"]);
        });

        it("should return empty array for plain text", () => {
            const interpolator = new Interpolator();
            const template = "Just some plain text without any variables.";

            expect(interpolator.getVariables(template)).toEqual([]);
        });

        it("should not match invalid or partial patterns", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => [`:${k}`, `\${${k}}`]
            });
            // ":" and "$" and "${}" should not match ([a-zA-Z0-9_-]+)
            const template = "Invalid: : , empty: ${}, prefix: hello:, just symbol: $";

            expect(interpolator.getVariables(template)).toEqual([]);
        });

        it("should support underscores and hyphens in variable names", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => `:${k}`
            });
            const template = "Data: :user_name and :last-login and :VAR_123";

            expect(interpolator.getVariables(template)).toEqual(["user_name", "last-login", "VAR_123"]);
        });

        it("should handle adjacent variables", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => `:${k}`
            });
            const template = ":a:b:c";
            
            expect(interpolator.getVariables(template)).toEqual(["a", "b", "c"]);
        });

        it("should handle variables inside larger text", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => `:${k}`
            });
            // Depending on implementation, "abc:name" might or might not match.
            // pattern() uses g flag and join("|"), if :name is matched it extracts "name".
            const template = "abc:name def:val123";
            
            expect(interpolator.getVariables(template)).toEqual(["name", "val123"]);
        });

        it("should work with custom syntax like {{key}}", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => `{{${k}}}`
            });
            const template = "Template with {{custom_syntax}} and {{another-one}}";

            expect(interpolator.getVariables(template)).toEqual(["custom_syntax", "another-one"]);
        });

        it("should be consistent with normalize()", () => {
            const normalizer = (k: string) => `@@${k}@@`;
            const interpolator = new Interpolator({ normalizer });
            const template = "Check @@this@@ and @@that@@";

            expect(interpolator.getVariables(template)).toEqual(["this", "that"]);
        });

        it("should handle a mix of complex patterns", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => [`:${k}`, `\${${k}}`, `$${k}`]
            });
            const template = ":name lives in ${city} at $address";

            expect(interpolator.getVariables(template)).toEqual(["name", "city", "address"]);
        });

        it("should maintain deterministic order based on first appearance", () => {
            const interpolator = new Interpolator({
                normalizer: (k) => `:${k}`
            });
            const template = ":c :a :b :a :c";

            expect(interpolator.getVariables(template)).toEqual(["c", "a", "b"]);
        });
    });
});
