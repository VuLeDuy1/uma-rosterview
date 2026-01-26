<script lang="ts">
    interface Props {
        filters: {
            blues: {
                speed: boolean;
                stamina: boolean;
                power: boolean;
                guts: boolean;
                wit: boolean;
                stars: number;
                useTotalStars: boolean;
                totalStars: number;
                minStars: {
                    speed: number;
                    stamina: number;
                    power: number;
                    guts: number;
                    wit: number;
                };
            };
            reds: {
                turf: boolean;
                dirt: boolean;
                frontRunner: boolean;
                paceChaser: boolean;
                lateSurger: boolean;
                endCloser: boolean;
                sprint: boolean;
                mile: boolean;
                medium: boolean;
                long: boolean;
                stars: number;
                useTotalStars: boolean;
                totalStars: number;
                minStars: {
                    turf: number;
                    dirt: number;
                    frontRunner: number;
                    paceChaser: number;
                    lateSurger: number;
                    endCloser: number;
                    sprint: number;
                    mile: number;
                    medium: number;
                    long: number;
                };
            };
            greens: { stars: number };
            whites: { [key: string]: number };
            whitesIncludeParents: boolean;
        };
        availableWhites: string[] | (() => string[]);
    }

    import SkillFilter from "./SkillFilter.svelte";

    let { filters, availableWhites }: Props = $props();

    let showModal = $state(false);

    function openModal() {
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }

    function resetFilters() {
        // Reset blues
        filters.blues.speed = false;
        filters.blues.stamina = false;
        filters.blues.power = false;
        filters.blues.guts = false;
        filters.blues.wit = false;
        filters.blues.stars = 1;
        filters.blues.useTotalStars = false;
        filters.blues.totalStars = 9;
        filters.blues.minStars = {
            speed: 0,
            stamina: 0,
            power: 0,
            guts: 0,
            wit: 0,
        };

        // Reset reds
        filters.reds.turf = false;
        filters.reds.dirt = false;
        filters.reds.frontRunner = false;
        filters.reds.paceChaser = false;
        filters.reds.lateSurger = false;
        filters.reds.endCloser = false;
        filters.reds.sprint = false;
        filters.reds.mile = false;
        filters.reds.medium = false;
        filters.reds.long = false;
        filters.reds.stars = 1;
        filters.reds.useTotalStars = false;
        filters.reds.totalStars = 9;
        filters.reds.minStars = {
            turf: 0,
            dirt: 0,
            frontRunner: 0,
            paceChaser: 0,
            lateSurger: 0,
            endCloser: 0,
            sprint: 0,
            mile: 0,
            medium: 0,
            long: 0,
        };

        // Reset greens
        filters.greens.stars = 0;

        // Reset whites - set all to 0
        const whiteKeys = Object.keys(filters.whites);
        whiteKeys.forEach((k) => {
            filters.whites[k] = 0;
        });
        filters.whitesIncludeParents = false;
    }
</script>

<button class="btn dropdown-toggle" type="button" onclick={openModal}>
    Filters
</button>

{#if showModal}
    <!-- Backdrop -->
    <div class="modal-backdrop fade show" onclick={closeModal}></div>

    <div class="modal fade show" style="display: block;" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Filters</h5>
                    <button
                        type="button"
                        class="btn-close"
                        onclick={closeModal}
                        aria-label="Close"
                    ></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-3">
                            <h6>Blues (Stats)</h6>
                            <div class="form-check form-switch mb-2">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    id="blueAdvanced"
                                    bind:checked={filters.blues.useTotalStars}
                                />
                                <label
                                    class="form-check-label"
                                    for="blueAdvanced"
                                    ><small>Lineage Mode</small></label
                                >
                            </div>
                            {#if !filters.blues.useTotalStars}
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="blueSpeed"
                                        bind:checked={filters.blues.speed}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="blueSpeed">Speed</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="blueStamina"
                                        bind:checked={filters.blues.stamina}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="blueStamina">Stamina</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="bluePower"
                                        bind:checked={filters.blues.power}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="bluePower">Power</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="blueGuts"
                                        bind:checked={filters.blues.guts}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="blueGuts">Guts</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="blueWit"
                                        bind:checked={filters.blues.wit}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="blueWit">Wit</label
                                    >
                                </div>
                                <br />
                                <label class="form-label">Min Stars:</label>
                                <div class="btn-group" role="group">
                                    <button
                                        type="button"
                                        class="btn {filters.blues.stars === 1
                                            ? 'btn-primary'
                                            : 'btn-outline-secondary'} btn-sm"
                                        onclick={() =>
                                            (filters.blues.stars = 1)}>1</button
                                    >
                                    <button
                                        type="button"
                                        class="btn {filters.blues.stars === 2
                                            ? 'btn-primary'
                                            : 'btn-outline-secondary'} btn-sm"
                                        onclick={() =>
                                            (filters.blues.stars = 2)}>2</button
                                    >
                                    <button
                                        type="button"
                                        class="btn {filters.blues.stars === 3
                                            ? 'btn-primary'
                                            : 'btn-outline-secondary'} btn-sm"
                                        onclick={() =>
                                            (filters.blues.stars = 3)}>3</button
                                    >
                                </div>
                            {:else}
                                <div class="mb-2">
                                    <label class="form-label form-label-sm"
                                        >Total Stars:</label
                                    ><input
                                        type="number"
                                        class="form-control form-control-sm"
                                        min="3"
                                        max="9"
                                        bind:value={filters.blues.totalStars}
                                    />
                                </div>
                                <small class="text-muted">Min per stat:</small>
                                <div class="mb-1">
                                    <label class="form-label form-label-sm"
                                        >Speed:</label
                                    ><input
                                        type="number"
                                        class="form-control form-control-sm"
                                        min="0"
                                        max="9"
                                        bind:value={
                                            filters.blues.minStars.speed
                                        }
                                    />
                                </div>
                                <div class="mb-1">
                                    <label class="form-label form-label-sm"
                                        >Stamina:</label
                                    ><input
                                        type="number"
                                        class="form-control form-control-sm"
                                        min="0"
                                        max="9"
                                        bind:value={
                                            filters.blues.minStars.stamina
                                        }
                                    />
                                </div>
                                <div class="mb-1">
                                    <label class="form-label form-label-sm"
                                        >Power:</label
                                    ><input
                                        type="number"
                                        class="form-control form-control-sm"
                                        min="0"
                                        max="9"
                                        bind:value={
                                            filters.blues.minStars.power
                                        }
                                    />
                                </div>
                                <div class="mb-1">
                                    <label class="form-label form-label-sm"
                                        >Guts:</label
                                    ><input
                                        type="number"
                                        class="form-control form-control-sm"
                                        min="0"
                                        max="9"
                                        bind:value={filters.blues.minStars.guts}
                                    />
                                </div>
                                <div class="mb-1">
                                    <label class="form-label form-label-sm"
                                        >Wit:</label
                                    ><input
                                        type="number"
                                        class="form-control form-control-sm"
                                        min="0"
                                        max="9"
                                        bind:value={filters.blues.minStars.wit}
                                    />
                                </div>
                            {/if}
                            <br />
                        </div>
                        <div class="col-md-3">
                            <h6>Reds (Aptitudes)</h6>
                            <div class="form-check form-switch mb-2">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    id="redAdvanced"
                                    bind:checked={filters.reds.useTotalStars}
                                />
                                <label
                                    class="form-check-label"
                                    for="redAdvanced"
                                    ><small>Lineage Mode</small></label
                                >
                            </div>
                            {#if !filters.reds.useTotalStars}
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="redTurf"
                                        bind:checked={filters.reds.turf}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="redTurf">Turf</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="redDirt"
                                        bind:checked={filters.reds.dirt}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="redDirt">Dirt</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="redFrontRunner"
                                        bind:checked={filters.reds.frontRunner}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="redFrontRunner">Front Runner</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="redPaceChaser"
                                        bind:checked={filters.reds.paceChaser}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="redPaceChaser">Pace Chaser</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="redLateSurger"
                                        bind:checked={filters.reds.lateSurger}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="redLateSurger">Late Surger</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="redEndCloser"
                                        bind:checked={filters.reds.endCloser}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="redEndCloser">End Closer</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="redSprint"
                                        bind:checked={filters.reds.sprint}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="redSprint">Sprint</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="redMile"
                                        bind:checked={filters.reds.mile}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="redMile">Mile</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="redMedium"
                                        bind:checked={filters.reds.medium}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="redMedium">Medium</label
                                    >
                                </div>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="redLong"
                                        bind:checked={filters.reds.long}
                                    />
                                    <label
                                        class="form-check-label"
                                        for="redLong">Long</label
                                    >
                                </div>
                                <br />
                                <label class="form-label">Min Stars:</label>
                                <div class="btn-group" role="group">
                                    <button
                                        type="button"
                                        class="btn {filters.reds.stars === 1
                                            ? 'btn-primary'
                                            : 'btn-outline-secondary'} btn-sm"
                                        onclick={() => (filters.reds.stars = 1)}
                                        >1</button
                                    >
                                    <button
                                        type="button"
                                        class="btn {filters.reds.stars === 2
                                            ? 'btn-primary'
                                            : 'btn-outline-secondary'} btn-sm"
                                        onclick={() => (filters.reds.stars = 2)}
                                        >2</button
                                    >
                                    <button
                                        type="button"
                                        class="btn {filters.reds.stars === 3
                                            ? 'btn-primary'
                                            : 'btn-outline-secondary'} btn-sm"
                                        onclick={() => (filters.reds.stars = 3)}
                                        >3</button
                                    >
                                </div>
                            {:else}
                                <div class="mb-2">
                                    <label class="form-label form-label-sm"
                                        >Total Stars:</label
                                    ><input
                                        type="number"
                                        class="form-control form-control-sm"
                                        min="3"
                                        max="30"
                                        bind:value={filters.reds.totalStars}
                                    />
                                </div>
                                <small class="text-muted">Min per apt:</small>
                                <div class="row g-1">
                                    <div class="col-6 mb-1">
                                        <label class="form-label form-label-sm"
                                            >Turf:</label
                                        ><input
                                            type="number"
                                            class="form-control form-control-sm"
                                            min="0"
                                            max="9"
                                            bind:value={
                                                filters.reds.minStars.turf
                                            }
                                        />
                                    </div>
                                    <div class="col-6 mb-1">
                                        <label class="form-label form-label-sm"
                                            >Dirt:</label
                                        ><input
                                            type="number"
                                            class="form-control form-control-sm"
                                            min="0"
                                            max="9"
                                            bind:value={
                                                filters.reds.minStars.dirt
                                            }
                                        />
                                    </div>
                                    <div class="col-6 mb-1">
                                        <label class="form-label form-label-sm"
                                            >Front:</label
                                        ><input
                                            type="number"
                                            class="form-control form-control-sm"
                                            min="0"
                                            max="9"
                                            bind:value={
                                                filters.reds.minStars
                                                    .frontRunner
                                            }
                                        />
                                    </div>
                                    <div class="col-6 mb-1">
                                        <label class="form-label form-label-sm"
                                            >Pace:</label
                                        ><input
                                            type="number"
                                            class="form-control form-control-sm"
                                            min="0"
                                            max="9"
                                            bind:value={
                                                filters.reds.minStars.paceChaser
                                            }
                                        />
                                    </div>
                                    <div class="col-6 mb-1">
                                        <label class="form-label form-label-sm"
                                            >Late:</label
                                        ><input
                                            type="number"
                                            class="form-control form-control-sm"
                                            min="0"
                                            max="9"
                                            bind:value={
                                                filters.reds.minStars.lateSurger
                                            }
                                        />
                                    </div>
                                    <div class="col-6 mb-1">
                                        <label class="form-label form-label-sm"
                                            >End:</label
                                        ><input
                                            type="number"
                                            class="form-control form-control-sm"
                                            min="0"
                                            max="9"
                                            bind:value={
                                                filters.reds.minStars.endCloser
                                            }
                                        />
                                    </div>
                                    <div class="col-6 mb-1">
                                        <label class="form-label form-label-sm"
                                            >Sprint:</label
                                        ><input
                                            type="number"
                                            class="form-control form-control-sm"
                                            min="0"
                                            max="9"
                                            bind:value={
                                                filters.reds.minStars.sprint
                                            }
                                        />
                                    </div>
                                    <div class="col-6 mb-1">
                                        <label class="form-label form-label-sm"
                                            >Mile:</label
                                        ><input
                                            type="number"
                                            class="form-control form-control-sm"
                                            min="0"
                                            max="9"
                                            bind:value={
                                                filters.reds.minStars.mile
                                            }
                                        />
                                    </div>
                                    <div class="col-6 mb-1">
                                        <label class="form-label form-label-sm"
                                            >Med:</label
                                        ><input
                                            type="number"
                                            class="form-control form-control-sm"
                                            min="0"
                                            max="9"
                                            bind:value={
                                                filters.reds.minStars.medium
                                            }
                                        />
                                    </div>
                                    <div class="col-6 mb-1">
                                        <label class="form-label form-label-sm"
                                            >Long:</label
                                        ><input
                                            type="number"
                                            class="form-control form-control-sm"
                                            min="0"
                                            max="9"
                                            bind:value={
                                                filters.reds.minStars.long
                                            }
                                        />
                                    </div>
                                </div>
                            {/if}
                            <br />
                        </div>
                        <div class="col-md-3">
                            <h6>Greens</h6>
                            <label class="form-label">Min Stars:</label>
                            <div class="btn-group" role="group">
                                <button
                                    type="button"
                                    class="btn {filters.greens.stars === 1
                                        ? 'btn-primary'
                                        : 'btn-outline-secondary'} btn-sm"
                                    onclick={() => (filters.greens.stars = 1)}
                                    >1</button
                                >
                                <button
                                    type="button"
                                    class="btn {filters.greens.stars === 2
                                        ? 'btn-primary'
                                        : 'btn-outline-secondary'} btn-sm"
                                    onclick={() => (filters.greens.stars = 2)}
                                    >2</button
                                >
                                <button
                                    type="button"
                                    class="btn {filters.greens.stars === 3
                                        ? 'btn-primary'
                                        : 'btn-outline-secondary'} btn-sm"
                                    onclick={() => (filters.greens.stars = 3)}
                                    >3</button
                                >
                            </div>
                            <br />
                        </div>
                        <div class="col-md-3">
                            <h6>Whites (Skills)</h6>
                            <div class="form-check mb-2">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    id="whitesIncludeParents"
                                    bind:checked={filters.whitesIncludeParents}
                                />
                                <label
                                    class="form-check-label"
                                    for="whitesIncludeParents"
                                >
                                    <small>Include Parents</small>
                                </label>
                            </div>
                            <SkillFilter
                                whites={filters.whites}
                                {availableWhites}
                                includeParents={filters.whitesIncludeParents}
                            />
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-outline-danger me-auto"
                        onclick={resetFilters}>Reset Filters</button
                    >
                    <button
                        type="button"
                        class="btn btn-secondary"
                        onclick={closeModal}>Close</button
                    >
                </div>
            </div>
        </div>
    </div>
{/if}
