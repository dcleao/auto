# See the README for installation instructions.

# Automatic variables
# $@ the target that fired the rule
# $< the first prerequisite
# $^ ALL the prerequisites (local to a rule or indirect)

NODE_PATH ?= ./node_modules
JS_UGLIFY = $(NODE_PATH)/uglify-js/bin/uglifyjs
JS_TESTER = $(NODE_PATH)/vows/bin/vows --color
CORE_SRC  = src/auto/core/

all: \
	dist/auto.js \
	dist/auto.min.js

.INTERMEDIATE dist/auto.js: \
	build-res/auto-begin.js \
	dist/auto.core.js \
	build-res/auto-end.js

dist/auto.core.js: \
	${CORE_SRC}base.js \
	${CORE_SRC}merge.js \
	${CORE_SRC}safeFactory.js \
	${CORE_SRC}atype.js \
	${CORE_SRC}ptype.js \
	${CORE_SRC}typeDefs/fun.js \
	${CORE_SRC}typeDefs/string.js \
	${CORE_SRC}typeDefs/object.js \
	${CORE_SRC}typeDefs/error.js \
	${CORE_SRC}ctype.js \
	${CORE_SRC}typeDefs/array.like.js \
	${CORE_SRC}typeDefs/array.js \
	${CORE_SRC}typeDefs/number.js \
	${CORE_SRC}math.js \
	${CORE_SRC}disposable.js \
	${CORE_SRC}enumerator.js \
	${CORE_SRC}typeDefs/enumerator.js \
	${CORE_SRC}enumerator.terminals.js \
	${CORE_SRC}generator.js \
	${CORE_SRC}generators/sequence.js \
	${CORE_SRC}generators/random.js \
	${CORE_SRC}enumerable.js \
	${CORE_SRC}typeDefs/enumerable.js \
	${CORE_SRC}queryable.js \
	${CORE_SRC}typeDefs/queryable.js \
	${CORE_SRC}queryable.methods.js
    
test: all
	@$(JS_TESTER)

# The main output files depend on the version of the Makefile itself!
# Changing the makefile implies rebuilding the main outputs!
%.min.js: %.js Makefile
	@rm -f dist/$@
	$(JS_UGLIFY) $< -c -m -o $@

# The pattern "auto.%js" is chosen to match "auto.js" and "auto.core.js"
# but not auto-begin.js
auto.%js: Makefile
	@rm -f $@
	# The following % has nothing to do with the outer % in "auto.%.js"
	# it is here to make sure that the Makefile dependency is not processed!
	@cat $(filter %.js,$^) > $@.tmp
	$(JS_UGLIFY) $@.tmp -b indent-level=2 -o $@
	@rm $@.tmp
	@chmod a-w $@

clean:
	rm -f dist/*
