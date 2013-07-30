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
	${CORE_SRC}typeDef.js \
	${CORE_SRC}typesDefs/fun.js \
	${CORE_SRC}typesDefs/string.js \
	${CORE_SRC}typesDefs/error.js \
	${CORE_SRC}typesDefs/object.js \
	${CORE_SRC}safeFactory.js \
	${CORE_SRC}types/abstract.js \
	${CORE_SRC}typesDefs/array.js \
	${CORE_SRC}typesDefs/number.js \
	${CORE_SRC}typesDefs/array.like.js \
	${CORE_SRC}math.js \
	${CORE_SRC}disposable.js \
	${CORE_SRC}enumerator.js \
	${CORE_SRC}typesDefs/enumerator.js \
	${CORE_SRC}enumerator.terminals.js \
	${CORE_SRC}generator.js \
	${CORE_SRC}generators/sequence.js \
	${CORE_SRC}generators/random.js \
	${CORE_SRC}enumerable.js \
	${CORE_SRC}typesDefs/enumerable.js \
	${CORE_SRC}queryable.js \
	${CORE_SRC}typesDefs/queryable.js \
	${CORE_SRC}queryable.methods.js
#	${CORE_SRC}types/space.js \
#	${CORE_SRC}types/typeName.js \
#	${CORE_SRC}types/type.js
    
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
