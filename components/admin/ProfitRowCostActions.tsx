"use client";

import {
  useState,
} from "react";

type Props = {
  fulfillmentRunId:
    string | null;

  shippingCost:
    number;

  paymentProcessingCost:
    number;

  otherCost:
    number;

  pouchCostOverride:
    number | null;

  boxCostOverride:
    number | null;

  insertCostOverride:
    number | null;

  labelCostOverride:
    number | null;

  otherPackagingCostOverride:
    number | null;

  laborHourlyRateOverride:
    number | null;

  laborMinutesPerOrderOverride:
    number | null;
};

function optionalNumberValue(
  value:
    number | null
) {
  return value ===
    null
    ? ""
    : value.toString();
}

export default function ProfitRowCostActions({
  fulfillmentRunId,
  shippingCost,
  paymentProcessingCost,
  otherCost,
  pouchCostOverride,
  boxCostOverride,
  insertCostOverride,
  labelCostOverride,
  otherPackagingCostOverride,
  laborHourlyRateOverride,
  laborMinutesPerOrderOverride,
}: Props) {
  const [
    isOpen,
    setIsOpen,
  ] =
    useState(
      false
    );

  const [
    shippingValue,
    setShippingValue,
  ] =
    useState(
      shippingCost.toFixed(
        2
      )
    );

  const [
    processingValue,
    setProcessingValue,
  ] =
    useState(
      paymentProcessingCost.toFixed(
        2
      )
    );

  const [
    otherValue,
    setOtherValue,
  ] =
    useState(
      otherCost.toFixed(
        2
      )
    );

  const [
    pouchOverrideValue,
    setPouchOverrideValue,
  ] =
    useState(
      optionalNumberValue(
        pouchCostOverride
      )
    );

  const [
    boxOverrideValue,
    setBoxOverrideValue,
  ] =
    useState(
      optionalNumberValue(
        boxCostOverride
      )
    );

  const [
    insertOverrideValue,
    setInsertOverrideValue,
  ] =
    useState(
      optionalNumberValue(
        insertCostOverride
      )
    );

  const [
    labelOverrideValue,
    setLabelOverrideValue,
  ] =
    useState(
      optionalNumberValue(
        labelCostOverride
      )
    );

  const [
    otherPackagingOverrideValue,
    setOtherPackagingOverrideValue,
  ] =
    useState(
      optionalNumberValue(
        otherPackagingCostOverride
      )
    );

  const [
    laborRateOverrideValue,
    setLaborRateOverrideValue,
  ] =
    useState(
      optionalNumberValue(
        laborHourlyRateOverride
      )
    );

  const [
    laborMinutesOverrideValue,
    setLaborMinutesOverrideValue,
  ] =
    useState(
      optionalNumberValue(
        laborMinutesPerOrderOverride
      )
    );

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState<
      string |
      null
    >(
      null
    );

  async function saveCosts() {
    if (
      !fulfillmentRunId
    ) {
      setError(
        "Reserve inventory first so this fulfillment has a fulfillment run."
      );

      return;
    }

    setError(
      null
    );

    setIsSaving(
      true
    );

    try {
      const response =
        await fetch(
          `/api/admin/fulfillment-runs/${fulfillmentRunId}/costs`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                shippingCost:
                  shippingValue,

                paymentProcessingCost:
                  processingValue,

                otherCost:
                  otherValue,

                pouchCostOverride:
                  pouchOverrideValue,

                boxCostOverride:
                  boxOverrideValue,

                insertCostOverride:
                  insertOverrideValue,

                labelCostOverride:
                  labelOverrideValue,

                otherPackagingCostOverride:
                  otherPackagingOverrideValue,

                laborHourlyRateOverride:
                  laborRateOverrideValue,

                laborMinutesPerOrderOverride:
                  laborMinutesOverrideValue,
              }),
          }
        );

      const data =
        await response.json() as {
          success?:
            boolean;

          error?:
            string;
        };

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ??
          "Unable to save fulfillment costs."
        );
      }

      setIsOpen(
        false
      );

      window.location.reload();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Unable to save fulfillment costs."
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }

  function openModal() {
    setShippingValue(
      shippingCost.toFixed(
        2
      )
    );

    setProcessingValue(
      paymentProcessingCost.toFixed(
        2
      )
    );

    setOtherValue(
      otherCost.toFixed(
        2
      )
    );

    setPouchOverrideValue(
      optionalNumberValue(
        pouchCostOverride
      )
    );

    setBoxOverrideValue(
      optionalNumberValue(
        boxCostOverride
      )
    );

    setInsertOverrideValue(
      optionalNumberValue(
        insertCostOverride
      )
    );

    setLabelOverrideValue(
      optionalNumberValue(
        labelCostOverride
      )
    );

    setOtherPackagingOverrideValue(
      optionalNumberValue(
        otherPackagingCostOverride
      )
    );

    setLaborRateOverrideValue(
      optionalNumberValue(
        laborHourlyRateOverride
      )
    );

    setLaborMinutesOverrideValue(
      optionalNumberValue(
        laborMinutesPerOrderOverride
      )
    );

    setError(
      null
    );

    setIsOpen(
      true
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={
          openModal
        }
        className="rounded-full border border-[#D8CEC4] bg-white px-3 py-1.5 text-lg font-semibold leading-none text-[#665C54] transition hover:bg-[#F7F3EE]"
        aria-label="Edit fulfillment costs"
      >
        ⋯
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/35 px-4 py-8">
         
         
         
         <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[#DED4C9] bg-white p-6 shadow-2xl">            
            
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#26211D]">
                  Fulfillment costs
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#665C54]">
                  Enter actual shipment costs and optional overrides for this fulfillment.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(
                    false
                  );
                }}
                className="rounded-full border border-[#D8CEC4] px-3 py-1.5 text-sm font-semibold text-[#665C54]"
              >
                Close
              </button>
            </div>

            {!fulfillmentRunId ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                Reserve inventory for this fulfillment before entering its costs.
              </div>
            ) : null}

            <section className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#766B62]">
                Actual shipment costs
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-[#302A25]">
                    Shipping
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      shippingValue
                    }
                    onChange={(
                      event
                    ) => {
                      setShippingValue(
                        event.target.value
                      );
                    }}
                    className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#302A25]">
                    Processing
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      processingValue
                    }
                    onChange={(
                      event
                    ) => {
                      setProcessingValue(
                        event.target.value
                      );
                    }}
                    className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#302A25]">
                    Other
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      otherValue
                    }
                    onChange={(
                      event
                    ) => {
                      setOtherValue(
                        event.target.value
                      );
                    }}
                    className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                  />
                </label>
              </div>
            </section>

            <section className="mt-7 border-t border-[#E9E1D8] pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#766B62]">
                Optional fulfillment overrides
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#665C54]">
                Leave a field blank to use the historical global setting.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <label className="block">
                  <span className="text-sm font-medium text-[#302A25]">
                    Pouch cost per pouch
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={
                      pouchOverrideValue
                    }
                    onChange={(
                      event
                    ) => {
                      setPouchOverrideValue(
                        event.target.value
                      );
                    }}
                    placeholder="Use global setting"
                    className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#302A25]">
                    Box cost
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={
                      boxOverrideValue
                    }
                    onChange={(
                      event
                    ) => {
                      setBoxOverrideValue(
                        event.target.value
                      );
                    }}
                    placeholder="Use global setting"
                    className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#302A25]">
                    Insert cost
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={
                      insertOverrideValue
                    }
                    onChange={(
                      event
                    ) => {
                      setInsertOverrideValue(
                        event.target.value
                      );
                    }}
                    placeholder="Use global setting"
                    className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#302A25]">
                    Label cost
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={
                      labelOverrideValue
                    }
                    onChange={(
                      event
                    ) => {
                      setLabelOverrideValue(
                        event.target.value
                      );
                    }}
                    placeholder="Use global setting"
                    className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#302A25]">
                    Other packaging cost
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={
                      otherPackagingOverrideValue
                    }
                    onChange={(
                      event
                    ) => {
                      setOtherPackagingOverrideValue(
                        event.target.value
                      );
                    }}
                    placeholder="Use global setting"
                    className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#302A25]">
                    Labor hourly rate
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      laborRateOverrideValue
                    }
                    onChange={(
                      event
                    ) => {
                      setLaborRateOverrideValue(
                        event.target.value
                      );
                    }}
                    placeholder="Use global setting"
                    className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#302A25]">
                    Labor minutes per order
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      laborMinutesOverrideValue
                    }
                    onChange={(
                      event
                    ) => {
                      setLaborMinutesOverrideValue(
                        event.target.value
                      );
                    }}
                    placeholder="Use global setting"
                    className="mt-2 w-full rounded-xl border border-[#CFC3B7] px-3 py-2.5 text-sm"
                  />
                </label>
              </div>
            </section>

            {error ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              disabled={
                isSaving ||
                !fulfillmentRunId
              }
              onClick={() => {
                void saveCosts();
              }}
              className="mt-6 w-full rounded-full bg-[#26211D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#40372F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : "Save costs"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}