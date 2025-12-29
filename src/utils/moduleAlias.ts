import "module-alias/register";
import moduleAlias from "module-alias";
import { resolve } from "node:path";

// Register the @src alias
moduleAlias.addAlias("@src", resolve(process.cwd(), "dist"));
